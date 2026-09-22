from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
from crud import (
    create_student,
    delete_student,
    get_student,
    get_students,
    update_student,
)
from database import Base, engine, get_db
from schemas import (
    ChatRequest,
    ChatResponse,
    StudentCreate,
    StudentResponse,
    StudentUpdate,
)
from services.chat_service import process_chat


# ============================================
# Create Database Tables
# ============================================

Base.metadata.create_all(bind=engine)


# ============================================
# Create FastAPI Application
# ============================================

app = FastAPI(
    title="Student Database Application System",
    description="Backend API for managing student records and AI-powered student assistance.",
    version="1.0.0",
)


# ============================================
# CORS Configuration
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Root Endpoint
# ============================================

@app.get("/")
def root():
    return {
        "message": "Student Database Application System Backend is running"
    }


# ============================================
# Student CRUD Endpoints
# ============================================

@app.post(
    "/students",
    response_model=StudentResponse,
    status_code=201,
)
def add_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
):
    try:
        return create_student(db, student)

    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )


@app.get(
    "/students",
    response_model=list[StudentResponse],
)
def list_students(
    db: Session = Depends(get_db),
):
    return get_students(db)


@app.get(
    "/students/{student_id}",
    response_model=StudentResponse,
)
def read_student(
    student_id: int,
    db: Session = Depends(get_db),
):
    student = get_student(db, student_id)

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return student


@app.put(
    "/students/{student_id}",
    response_model=StudentResponse,
)
def edit_student(
    student_id: int,
    student: StudentUpdate,
    db: Session = Depends(get_db),
):
    updated_student = update_student(
        db,
        student_id,
        student,
    )

    if updated_student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return updated_student


@app.delete("/students/{student_id}")
def remove_student(
    student_id: int,
    db: Session = Depends(get_db),
):
    deleted_student = delete_student(
        db,
        student_id,
    )

    if deleted_student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return {
        "message": "Student deleted successfully",
        "student_id": student_id,
    }


# ============================================
# AI Chat Endpoint
# ============================================

@app.post(
    "/chat",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    answer = process_chat(
        db,
        request.question,
    )

    return ChatResponse(
        answer=answer
    )