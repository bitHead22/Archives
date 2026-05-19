"""
POST /api/ingest/{paper_id}
────────────────────────────
Upload a PDF for an existing paper record.
The paper must already exist in the papers table.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Path
from app.models import IngestResponse
from app.services.ingest import ingest_pdf

router = APIRouter(prefix="/api/ingest", tags=["Ingest"])

MAX_MB = 20
MAX_BYTES = MAX_MB * 1024 * 1024


@router.post("/{paper_id}", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_document(
    paper_id: str = Path(..., description="UUID of the paper record in Supabase"),
    file: UploadFile = File(...),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are accepted.",
        )

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {MAX_MB} MB limit.",
        )

    try:
        result = await ingest_pdf(pdf_bytes, paper_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    return IngestResponse(
        paper_id=result["paper_id"],
        chunks_stored=result["chunks_stored"],
        message="Paper ingested successfully.",
    )
