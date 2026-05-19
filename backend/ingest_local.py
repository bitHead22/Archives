import asyncio
import sys
import os
from app.database import get_supabase
from app.services.ingest import ingest_pdf

async def main():
    if len(sys.argv) < 2:
        print("Usage: python ingest_local.py <path_to_pdf> \"<subject>\"")
        print("Example: python ingest_local.py C:\\path\\to\\exam.pdf \"Data Structures\"")
        return

    pdf_path = sys.argv[1]
    subject = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(pdf_path)
    
    if not os.path.exists(pdf_path):
        print(f"Error - File not found: {pdf_path}")
        return

    db = get_supabase()
    
    # Let's attach it to Semester 3 so it shows up in your UI right away
    semesters = db.table("semesters").select("*").eq("number", 3).limit(1).execute()
    if not semesters.data:
        print("Semester 3 not found in DB. Did you run the seed script?")
        return
    sem_id = semesters.data[0]['id']

    # Read the file
    print(f"Reading {pdf_path}...")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    import uuid
    storage_path = f"local_test/{uuid.uuid4()}_{os.path.basename(pdf_path)}"
    
    print(f"Uploading PDF securely to Supabase Storage at 'papers/{storage_path}'...")
    db.storage.from_("papers").upload(
        path=storage_path, 
        file=pdf_bytes, 
        file_options={"content-type": "application/pdf"}
    )

    # 1. Insert Paper Record
    print(f"Creating paper database record for '{subject}' ...")
    paper_insert = db.table("papers").insert({
        "semester_id": sem_id,
        "subject": subject,
        "year": 2024,
        "exam_type": "first_term",
        "storage_path": storage_path,
        "ingested": False,
        "chunk_count": 0
    }).execute()
    
    paper_id = paper_insert.data[0]['id']
    print(f"Created Paper ID: {paper_id}")

    # 2. Ingest! (Chunks & Vectors using your Google API Key)
    print("Executing RAG Pipeline (Text Extraction -> Chunking -> Vector Embedding) ...")
    try:
        res = await ingest_pdf(pdf_bytes, paper_id)
        print(f"Success! {res['chunks_stored']} chunks stored in Supabase with vector embeddings.")
        print(f"You can now go to the frontend, click on First Term -> 2024, and see '{subject}' marked as AI READY!")
    except Exception as e:
        print(f"Failed to ingest: {e}")

if __name__ == "__main__":
    asyncio.run(main())
