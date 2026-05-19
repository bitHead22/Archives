"""
PDF Ingestion Service
─────────────────────
1. Read uploaded PDF with pypdf
2. If image-based or empty, fallback to Gemini 2.0 Flash OCR!
3. Split into overlapping text chunks
4. Embed each chunk natively with Google text-embedding-004
5. Update papers.ingested = true + store chunks in document_chunks
"""
import io
import os
import logging
import tempfile
from pypdf import PdfReader
import google.generativeai as genai
from app.config import settings
from app.database import get_supabase

logger = logging.getLogger(__name__)

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

# Configure genai natively
genai.configure(api_key=settings.GOOGLE_API_KEY)


def _extract_text_standard(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        logger.warning(f"Standard PDF extraction failed: {e}")
        return ""


def _extract_text_gemini_ocr(pdf_bytes: bytes) -> str:
    """Uses Gemini 2.0 Flash natively to process image-based scanned PDFs!"""
    logger.info("Triggering Gemini 2.0 Flash OCR Vision Extract...")
    
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name
    
    uploaded_file = None
    try:
        uploaded_file = genai.upload_file(tmp_path, mime_type="application/pdf")
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content([
            uploaded_file,
            "Extract ALL the text, math, and questions from this exam paper accurately. Maintain the structure and numbering precisely. Output only the extracted textual content; do not converse."
        ])
        return response.text
    except Exception as e:
        logger.error(f"Gemini OCR Failed: {e}")
        raise ValueError(f"Could not extract text via OCR: {str(e)}")
    finally:
        if uploaded_file:
            try:
                genai.delete_file(uploaded_file.name)
            except Exception:
                pass
        os.remove(tmp_path)


def _split_text(text: str) -> list[str]:
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start : start + CHUNK_SIZE])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c.strip() for c in chunks if c.strip()]


async def ingest_pdf(pdf_bytes: bytes, paper_id: str) -> dict:
    """
    Embed and store chunks for an already-uploaded paper record.
    If OCR is needed, seamlessly delegates to Gemini.
    """
    db = get_supabase()

    # 1. Extract
    logger.info(f"Extracting text for paper {paper_id} ...")
    text = _extract_text_standard(pdf_bytes)
    
    # If the text is very short/empty, it's likely a scanned image PDF
    if len(text.strip()) < 50:
        text = _extract_text_gemini_ocr(pdf_bytes)

    if not text or not text.strip():
        raise ValueError("Could not extract any text even with OCR.")

    # 2. Chunk
    chunks = _split_text(text.strip())
    logger.info(f"Split into {len(chunks)} chunks")

    # 3. Embed
    logger.info("Generating embeddings natively...")
    
    vectors = []
    # Gemini embed_content API takes a list or string. We can batch pass it directly!
    # A single call to embed_content with an array of strings is incredibly fast.
    response = genai.embed_content(
        model="models/gemini-embedding-001",
        content=chunks,
        task_type="retrieval_document",
        output_dimensionality=768
    )
    
    # The response is a dict that contains the list of embeddings under the 'embedding' key
    vectors = response['embedding']

    # 4. Delete any stale chunks (re-ingest support)
    db.table("document_chunks").delete().eq("paper_id", paper_id).execute()

    # 5. Batch insert chunks
    rows = [
        {
            "paper_id": paper_id,
            "chunk_index": i,
            "content": chunk,
            "embedding": vector,
        }
        for i, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]
    BATCH = 50
    for i in range(0, len(rows), BATCH):
        db.table("document_chunks").insert(rows[i : i + BATCH]).execute()

    # 6. Mark paper as ingested
    db.table("papers").update({
        "ingested": True,
        "chunk_count": len(chunks),
    }).eq("id", paper_id).execute()

    logger.info(f"Paper {paper_id} ingested — {len(chunks)} chunks stored.")
    return {"paper_id": paper_id, "chunks_stored": len(chunks)}
