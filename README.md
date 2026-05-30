# Archives 🎓

Archives is an intelligent, unified academic repository and AI-powered study assistant designed to transform the chaotic pre-exam scramble into a structured, strategic advantage. It provides students with an organized database of past university papers combined with a deeply contextual AI Tutor that can instantly solve and explain specific questions from the exams.

## 🚀 The Problem It Solves
Students often waste hours hunting down unorganized past exam papers across WhatsApp groups, Google Drives, and student portals. Even when they find the papers, they rarely come with an answer key, leaving students stranded if they can't solve a problem. 

**Archives solves this by:**
1. Providing a centralized, beautifully organized database categorized by Degree, Branch, and Semester.
2. Integrating a **Context-Aware AI Tutor** directly into the PDF viewer. You can ask a question, and the AI will extract the exact problem from the paper and solve it step-by-step using extensive academic knowledge.

---

## 🏗️ Project Architecture

Archives relies on a highly decoupled modern architecture separating the client-side presentation, the AI processing layer, and the database infrastructure.

1. **Client Layer (Vercel):** A blazing fast React SPA handles user authentication (via Supabase Auth), PDF rendering, and chat UI. It communicates directly with Supabase for fetching available courses/papers and handles document downloads securely.
2. **Backend API (Render):** A FastAPI server acts as the AI processing engine. It securely handles PDF ingestion (chunking/embedding) and handles the RAG inference endpoint.
3. **Infrastructure (Supabase & Google):** Supabase handles PostgreSQL storage (with `pgvector`), user authentication, and object storage for PDFs. Google Generative AI powers the embeddings and the LLM inference.

---

## 🧠 The RAG Pipeline

The AI Tutor is built on a highly optimized **Retrieval-Augmented Generation (RAG)** pipeline designed specifically for academic exam papers.

### 1. Ingestion Phase
- **Extraction:** When an exam paper is uploaded, text is extracted. If the PDF is a scanned image, the backend seamlessly falls back to **Gemini 2.0 Flash Vision** to perform highly accurate OCR, preserving math and structural formatting.
- **Chunking & Embedding:** The text is split into overlapping chunks and converted into dense vectors using Google's `gemini-embedding-001` model.
- **Vector Storage:** The vectors are stored in a Supabase PostgreSQL table using the `pgvector` extension, explicitly linked to the `paper_id` to prevent cross-contamination of contexts.

### 2. Retrieval & Generation Phase
- **Vector Search:** When a student asks a question while viewing a paper, the question is embedded and sent to a custom Supabase RPC function (`match_chunks`). This function performs a mathematically precise cosine similarity search **filtered strictly by the currently opened `paper_id`**.
- **Context Injection:** The top K most relevant text chunks are extracted and injected into a strict system prompt alongside the student's question and the conversation history.
- **Inference:** **Gemini 2.5 Flash** acts as the AI Tutor. It uses the retrieved context to locate the specific exam question, and then utilizes its pre-trained academic knowledge to fully solve the problem, returning a formatted, exam-ready answer to the frontend.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **PDF Rendering:** `react-pdf`
- **Routing:** React Router v7
- **Deployment:** Vercel

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **AI / LLM:** Google Generative AI (`gemini-2.5-flash`, `gemini-embedding-001`)
- **RAG Orchestration:** LangChain Core
- **Deployment:** Render

### Database & Infrastructure
- **Database:** Supabase (PostgreSQL with `pgvector` for similarity search)
- **Authentication:** Supabase Auth (Email/Password, Google OAuth)
- **Storage:** Supabase Storage (PDF buckets)
