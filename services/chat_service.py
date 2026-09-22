import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy import func
from sqlalchemy.orm import Session

import models


load_dotenv()


# ============================================
# Gemini Model
# ============================================

llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    temperature=0,
    google_api_key=os.getenv("GEMINI_API_KEY"),
)


# ============================================
# Student Statistics
# ============================================

def get_student_statistics(db: Session) -> dict:
    total_students = db.query(models.Student).count()

    male_students = (
        db.query(models.Student)
        .filter(func.lower(models.Student.gender) == "male")
        .count()
    )

    female_students = (
        db.query(models.Student)
        .filter(func.lower(models.Student.gender) == "female")
        .count()
    )

    return {
        "total_students": total_students,
        "male_students": male_students,
        "female_students": female_students,
    }


# ============================================
# AI Chat Processing
# ============================================

def process_chat(db: Session, question: str) -> str:

    statistics = get_student_statistics(db)

    prompt = f"""
You are a helpful student database assistant.

Answer the user's question using ONLY the student
statistics provided below.

Student statistics:
- Total students: {statistics["total_students"]}
- Male students: {statistics["male_students"]}
- Female students: {statistics["female_students"]}

User question:
{question}

Instructions:
- Give a concise and clear answer.
- Do not invent student information.
- If the question cannot be answered using the available
  statistics, politely explain that only basic student
  statistics are currently available.
"""

    response = llm.invoke(prompt)


    # ========================================
    # Convert LangChain Response to String
    # ========================================

    if isinstance(response.content, str):
        return response.content


    if isinstance(response.content, list):

        text_parts = []

        for block in response.content:

            if isinstance(block, dict):

                text = block.get("text")

                if text:
                    text_parts.append(text)

            elif isinstance(block, str):

                text_parts.append(block)


        return "".join(text_parts).strip()


    return str(response.content)