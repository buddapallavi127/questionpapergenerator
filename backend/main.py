from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from database import get_db_connection

# Initialize FastAPI app
app = FastAPI()

# CORS settings
origins = [
    "http://localhost:8080",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# SCHEMAS
# ---------------------------

class Question(BaseModel):
    text: str
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    type: str
    level: str
    subject: Optional[str] = None
    chapter: Optional[str] = None
    topic: Optional[str] = None
    class_: Optional[str] = None
    language: Optional[str] = None


class UpdateQuestion(Question):
    id: int


class QuestionOut(Question):
    id: int
    class Config:
        orm_mode = True


class QuestionFilters(BaseModel):
    class_: Optional[str] = None
    language: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None
    chapter: Optional[str] = None
    type: Optional[str] = None
    topic: Optional[str] = None


# ---------------------------
# ENDPOINTS
# ---------------------------

@app.post("/api/questions/upload-json")
def upload_json_questions(questions: List[Question]):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        for q in questions:
            cursor.execute("""
                INSERT INTO questions (text, option_a, option_b, option_c, option_d,
                                       type, level, subject, chapter, topic, class_, language)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                q.text, q.option_a, q.option_b, q.option_c, q.option_d,
                q.type, q.level, q.subject, q.chapter, q.topic, q.class_, q.language
            ))

        conn.commit()
        cursor.close()
        conn.close()
        return {"detail": "Questions uploaded successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload questions: {str(e)}")


@app.post("/api/questions/update-from-json")
def update_json_questions(questions: List[UpdateQuestion]):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        for q in questions:
            update_fields = []
            values = []

            for field in q.model_fields:
                if field != "id":
                    val = getattr(q, field)
                    if val is not None:
                        update_fields.append(f"{field} = %s")
                        values.append(val)

            if not update_fields:
                continue  # Skip if there's nothing to update

            values.append(q.id)

            query = f"""
                UPDATE questions SET {', '.join(update_fields)} WHERE id = %s
            """
            cursor.execute(query, values)

        conn.commit()
        cursor.close()
        conn.close()
        return {"detail": "Questions updated successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update questions: {str(e)}")


@app.post("/api/questions", response_model=List[QuestionOut])
def fetch_filtered_questions(filters: QuestionFilters):
    try:
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

        if not clauses:
            return []

        full_query = base_query + " AND ".join(clauses)
        cursor.execute(full_query, values)
        result = cursor.fetchall()

        cursor.close()
        conn.close()

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions: {str(e)}")
