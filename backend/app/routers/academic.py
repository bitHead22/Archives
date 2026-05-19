"""
GET /api/papers                    → list papers (optionally filter by semester)
GET /api/papers/{id}               → get single paper metadata
DELETE /api/papers/{id}            → delete paper + chunks
GET /api/courses                   → list all courses
GET /api/courses/{id}/semesters    → list semesters for a course
"""
import uuid
from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from app.database import get_supabase
from app.models import PaperMeta, CourseMeta, SemesterMeta

router = APIRouter(tags=["Academic"])

def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

# ── Papers ────────────────────────────────────────────────────
@router.get("/api/papers", response_model=list[PaperMeta])
def list_papers(semester_id: Optional[str] = Query(default=None)):
    if semester_id and not is_valid_uuid(semester_id):
        return []
        
    db = get_supabase()
    q = db.table("papers").select("id, subject, year, exam_type, ingested, chunk_count, created_at")
    if semester_id:
        q = q.eq("semester_id", semester_id)
    result = q.order("created_at", desc=True).execute()
    return [PaperMeta(**row) for row in (result.data or [])]


@router.get("/api/papers/{paper_id}", response_model=PaperMeta)
def get_paper(paper_id: str):
    if not is_valid_uuid(paper_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid paper ID format.")
        
    db = get_supabase()
    result = (
        db.table("papers")
        .select("id, subject, year, exam_type, ingested, chunk_count, created_at, storage_path")
        .eq("id", paper_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    return PaperMeta(**result.data[0])


@router.delete("/api/papers/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paper(paper_id: str):
    if not is_valid_uuid(paper_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid paper ID format.")
        
    db = get_supabase()
    check = db.table("papers").select("id").eq("id", paper_id).execute()
    if not check.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    # Chunks cascade-deleted via FK
    db.table("papers").delete().eq("id", paper_id).execute()


@router.get("/api/papers/{paper_id}/download-url")
def get_paper_download_url(paper_id: str):
    if not is_valid_uuid(paper_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid paper ID format.")
        
    db = get_supabase()
    res = db.table("papers").select("storage_path").eq("id", paper_id).execute()
    if not res.data or not res.data[0]["storage_path"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF storage path missing.")
        
    url_res = db.storage.from_("papers").create_signed_url(res.data[0]["storage_path"], 3600)
    return {"url": url_res["signedURL"]}


# ── Courses ───────────────────────────────────────────────────
@router.get("/api/courses", response_model=list[CourseMeta])
def list_courses():
    db = get_supabase()
    result = db.table("courses").select("id, name, description, created_at").execute()
    return [CourseMeta(**row) for row in (result.data or [])]


# ── Semesters ─────────────────────────────────────────────────
@router.get("/api/courses/{course_id}/semesters", response_model=list[SemesterMeta])
def list_semesters(course_id: str):
    if not is_valid_uuid(course_id):
        return []
        
    db = get_supabase()
    result = (
        db.table("semesters")
        .select("id, course_id, number, label")
        .eq("course_id", course_id)
        .order("number")
        .execute()
    )
    return [SemesterMeta(**row) for row in (result.data or [])]
