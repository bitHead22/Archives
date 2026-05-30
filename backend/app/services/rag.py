"""
RAG Query Service
──────────────────
1. Embed the user's question
2. Call match_chunks RPC on Supabase (vector similarity)
3. Build context-augmented prompt
4. Return Gemini's answer + sources
"""
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import google.generativeai as genai
from app.config import settings
from app.database import get_supabase
from app.models import SourceChunk, ChatMessage

logger = logging.getLogger(__name__)

_llm: ChatGoogleGenerativeAI | None = None

# Configure genai natively
genai.configure(api_key=settings.GOOGLE_API_KEY)


def _get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.3,
        )
    return _llm


def _retrieve_chunks(question: str, paper_id: str | None, top_k: int) -> list[SourceChunk]:
    response = genai.embed_content(
        model="models/gemini-embedding-001",
        content=question,
        task_type="retrieval_query",
        output_dimensionality=768
    )
    query_vector = response['embedding']
    db = get_supabase()

    params: dict = {
        "query_embedding": query_vector,
        "match_count": top_k,
    }
    if paper_id:
        params["filter_paper_id"] = paper_id

    result = db.rpc("match_chunks", params).execute()

    return [
        SourceChunk(
            content=row["content"],
            paper_id=row["paper_id"],
            chunk_index=row["chunk_index"],
            similarity=row.get("similarity"),
        )
        for row in (result.data or [])
    ]


SYSTEM_PROMPT = """You are Archives, an expert academic study assistant.
The context below contains excerpts from an academic document (usually an exam question paper).
If the user asks you to solve or answer a question from the context, use the context to identify the exact question they are referring to, and then use your own extensive academic knowledge to SOLVE and ANSWER that question accurately and thoroughly.
Do not refuse to answer just because the answer key isn't in the context. Provide the solution.
When referencing specific questions or text from the context, cite the chunk numbers (e.g., [Chunk 2]).
Be concise, structured, and exam-focused.

CONTEXT:
{context}
"""


async def answer_question(
    question: str,
    paper_id: str | None,
    chat_history: list[ChatMessage],
    top_k: int,
) -> dict:
    logger.info(f"RAG query: {question[:80]}")
    sources = _retrieve_chunks(question, paper_id, top_k)

    if not sources:
        return {
            "answer": "No relevant content found. Make sure the paper has been ingested.",
            "sources": [],
            "paper_id": paper_id,
        }

    context = "\n\n".join(
        f"[Chunk {c.chunk_index}] {c.content}" for c in sources
    )

    messages = [SystemMessage(content=SYSTEM_PROMPT.format(context=context))]
    for msg in chat_history:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            messages.append(AIMessage(content=msg.content))
    messages.append(HumanMessage(content=question))

    response = _get_llm().invoke(messages)
    return {
        "answer": response.content,
        "sources": sources,
        "paper_id": paper_id,
    }
