from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db


# Separate in-memory database for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


# Create test database tables
Base.metadata.create_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


# Tell FastAPI to use the test database
app.dependency_overrides[get_db] = override_get_db


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200

    assert response.json() == {
        "message": "Student Database Application System Backend is running"
    }


def test_create_student():
    response = client.post(
        "/students",
        json={
            "name": "Test Student",
            "age": 20,
            "gender": "Male",
            "course": "B.Tech Computer Science",
            "email": "teststudent@example.com",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Test Student"
    assert data["age"] == 20
    assert data["gender"] == "Male"
    assert data["course"] == "B.Tech Computer Science"
    assert data["email"] == "teststudent@example.com"
    assert "id" in data


def test_get_students():
    response = client.get("/students")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["name"] == "Test Student"
    assert data[0]["course"] == "B.Tech Computer Science"


def test_get_student_by_id():
    response = client.get("/students/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["name"] == "Test Student"
    assert data["age"] == 20
    assert data["course"] == "B.Tech Computer Science"


def test_update_student():
    response = client.put(
        "/students/1",
        json={
            "name": "Updated Test Student",
            "age": 21,
            "gender": "Male",
            "course": "BCA",
            "email": "updated@example.com",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["name"] == "Updated Test Student"
    assert data["age"] == 21
    assert data["course"] == "BCA"
    assert data["email"] == "updated@example.com"


def test_delete_student():
    response = client.delete("/students/1")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Student deleted successfully"
    assert data["student_id"] == 1


def test_get_nonexistent_student():
    response = client.get("/students/999")

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Student not found"
    }


def test_create_student_invalid_data():
    response = client.post(
        "/students",
        json={
            "name": "Invalid Student",
            "age": "twenty",
            "gender": "Male",
            "course": "BCA",
            "email": "invalid@example.com",
        },
    )

    assert response.status_code == 422


def test_chat_endpoint():
    response = client.post(
        "/chat",
        json={
            "question": "How many students are there?"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "answer" in data
    assert isinstance(data["answer"], str)
    assert len(data["answer"]) > 0


def test_chat_gemini_response(monkeypatch):
    class MockResponse:
        content = "This is a mocked Gemini response."

    class MockLLM:
        def invoke(self, prompt):
            return MockResponse()

    monkeypatch.setattr(
        "services.chat_service.llm",
        MockLLM(),
    )

    response = client.post(
        "/chat",
        json={
            "question": "What does a student database system do?"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["answer"] == "This is a mocked Gemini response."


def test_duplicate_email():
    first_response = client.post(
        "/students",
        json={
            "name": "First Student",
            "age": 20,
            "gender": "Male",
            "course": "BCA",
            "email": "duplicate@example.com",
        },
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/students",
        json={
            "name": "Second Student",
            "age": 21,
            "gender": "Female",
            "course": "B.Tech Computer Science",
            "email": "duplicate@example.com",
        },
    )

    assert second_response.status_code == 409

    assert second_response.json() == {
        "detail": "Email already exists"
    }