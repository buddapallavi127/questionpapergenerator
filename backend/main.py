from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
from database import get_db_connection
from io import BytesIO

app = FastAPI()

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

    model_config = {
        "from_attributes": True
    }

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

    if not clauses:
        cursor.close()
        conn.close()
        return []

    full_query = base_query + " AND ".join(clauses)
    cursor.execute(full_query, values)
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result

@app.post("/api/questions/upload-xlsx")
async def upload_xlsx(file: UploadFile = File(...)):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")
    try:
        contents = await file.read()

        # Use BytesIO to wrap bytes for pandas read_excel
        df = pd.read_excel(BytesIO(contents))

        required_columns = ['text', 'option_a', 'option_b', 'option_c', 'option_d',
                            'type', 'level', 'subject', 'chapter', 'topic', 'class_', 'language']

        # Normalize column names to lowercase
        df.columns = df.columns.str.lower()

        # Check if all required columns exist in the dataframe columns
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=400, detail=f"Missing columns in Excel: {missing_cols}")

        conn = get_db_connection()
        cursor = conn.cursor()

        for _, row in df.iterrows():
            cursor.execute("""
                INSERT INTO questions (text, option_a, option_b, option_c, option_d,
                                       type, level, subject, chapter, topic, class_, language)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                row.get('text'), row.get('option_a'), row.get('option_b'), row.get('option_c'), row.get('option_d'),
                row.get('type'), row.get('level'), row.get('subject'), row.get('chapter'),
                row.get('topic'), row.get('class_'), row.get('language')
            ))

        conn.commit()
        cursor.close()
        conn.close()
        return {"detail": "Questions uploaded successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload: {str(e)}")