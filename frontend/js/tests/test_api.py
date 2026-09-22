from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == (
        "Student Database Application System Backend is running"
    )


def test_get_students():
    response = client.get("/students")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)


def test_create_student():
    student = {
        "name": "Test Student",
        "age": 21,
        "gender": "Male",
        "course": "B.Tech",
        "email": "test.student.unique@example.com",
    }

    response = client.post(
        "/students",
        json=student,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == student["name"]
    assert data["age"] == student["age"]
    assert data["gender"] == student["gender"]
    assert data["course"] == student["course"]
    assert data["email"] == student["email"]

    student_id = data["id"]

    # Cleanup test student
    delete_response = client.delete(
        f"/students/{student_id}"
    )

    assert delete_response.status_code == 200


def test_get_nonexistent_student():
    response = client.get("/students/999999")

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Student not found"


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

    assert isinstance(
        data["answer"],
        str,
    )

    assert len(data["answer"].strip()) > 0