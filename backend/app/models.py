from pydantic import BaseModel, Field
from typing import Optional


# ── Ingest ────────────────────────────────────────────────────
class IngestResponse(BaseModel):
    paper_id: str
    chunks_stored: int
    message: str


# ── Chat / Q&A ────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    paper_id: Optional[str] = None      # None → search all ingested papers
    chat_history: list[ChatMessage] = []
    top_k: int = Field(default=5, ge=1, le=20)


class SourceChunk(BaseModel):
    content: str
    paper_id: str
    chunk_index: int
    similarity: Optional[float] = None


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]
    paper_id: Optional[str] = None


class PaperMeta(BaseModel):
    id: str
    subject: str
    year: Optional[int] = None
    exam_type: Optional[str] = None
    ingested: bool
    chunk_count: int
    created_at: str
    storage_path: Optional[str] = None


# ── Semesters ─────────────────────────────────────────────────
class SemesterMeta(BaseModel):
    id: str
    course_id: str
    number: int
    label: Optional[str] = None


# ── Courses ───────────────────────────────────────────────────
class CourseMeta(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: str
