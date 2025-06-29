from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from database import get_db_connection

app = FastAPI()

# Allow both frontend and backend for local dev
origins = [
    "http://localhost:8080",  # Frontend
    "http://localhost:8000",  # Backend (Postman or other tools)
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Output model including options for MCQs
class QuestionOut(BaseModel):
    id: int
    text: str
    subject: Optional[str] = None
    chapter: Optional[str] = None
    topic: Optional[str] = None
    level: Optional[str] = None
    type: Optional[str] = None
    class_: Optional[str] = None
    language: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None

    class Config:
        orm_mode = True

# Filters input from frontend
class QuestionFilters(BaseModel):
    class_: Optional[str] = None
    language: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None
    chapter: Optional[str] = None
    type: Optional[str] = None
    topic: Optional[str] = None

@app.post("/api/questions", response_model=List[QuestionOut])
def fetch_filtered_questions(filters: QuestionFilters):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    base_query = """
        SELECT 
            id, text, subject, chapter, topic, level, type, class_, language,
            option_a, option_b, option_c, option_d
        FROM questions
        WHERE
    """
    clauses = []
    values = []

    if filters.subject:
        clauses.append("LOWER(subject) = LOWER(%s)")
        values.append(filters.subject)
    if filters.chapter:
        clauses.append("LOWER(chapter) = LOWER(%s)")
        values.append(filters.chapter)
    if filters.topic:
        clauses.append("LOWER(topic) = LOWER(%s)")
        values.append(filters.topic)
    if filters.level:
        clauses.append("LOWER(level) = LOWER(%s)")
        values.append(filters.level)
    if filters.type:
        clauses.append("LOWER(type) = LOWER(%s)")
        values.append(filters.type)
    if filters.class_:
        clauses.append("LOWER(class_) = LOWER(%s)")
        values.append(filters.class_)
    if filters.language:
        clauses.append("LOWER(language) = LOWER(%s)")
        values.append(filters.language)

    # If no filters are applied, return an empty list
    if not clauses:
        return []

    # Combine WHERE clauses
    full_query = base_query + " AND ".join(clauses)

    # Execute query
    cursor.execute(full_query, values)
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result
