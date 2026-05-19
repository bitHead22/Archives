"""
POST /api/query
─────────────────
Send a question with optional paper_id filter and get an RAG answer.
"""
from fastapi import APIRouter, HTTPException, status
from app.models import QueryRequest, QueryResponse
from app.services.rag import answer_question

router = APIRouter(prefix="/api/query", tags=["Query"])


@router.post("", response_model=QueryResponse)
async def query(payload: QueryRequest):
    try:
        result = await answer_question(
            question=payload.question,
            paper_id=payload.paper_id,
            chat_history=payload.chat_history,
            top_k=payload.top_k,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    return QueryResponse(**result)
