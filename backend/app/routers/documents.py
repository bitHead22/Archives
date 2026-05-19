"""
GET  /api/documents              → list all documents for a user
GET  /api/documents/{id}         → get a single document's metadata
DELETE /api/documents/{id}       → delete a document + its chunks
"""
from fastapi import APIRouter, Header, HTTPException, status
from app.database import get_supabase
from app.models import DocumentMeta

router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.get("", response_model=list[DocumentMeta])
def list_documents(x_user_id: str = Header(..., alias="x-user-id")):
    db = get_supabase()
    result = (
        db.table("documents")
        .select("id, filename, created_at, chunk_count")
        .eq("user_id", x_user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [DocumentMeta(**row) for row in (result.data or [])]


@router.get("/{document_id}", response_model=DocumentMeta)
def get_document(document_id: str, x_user_id: str = Header(..., alias="x-user-id")):
    db = get_supabase()
    result = (
        db.table("documents")
        .select("id, filename, created_at, chunk_count")
        .eq("id", document_id)
        .eq("user_id", x_user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return DocumentMeta(**result.data)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, x_user_id: str = Header(..., alias="x-user-id")):
    db = get_supabase()
    # Confirm ownership
    check = (
        db.table("documents")
        .select("id")
        .eq("id", document_id)
        .eq("user_id", x_user_id)
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Chunks are cascade-deleted in Supabase (see migration FK constraint)
    db.table("documents").delete().eq("id", document_id).execute()
