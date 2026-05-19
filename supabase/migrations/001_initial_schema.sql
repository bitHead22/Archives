-- ══════════════════════════════════════════════════════════════
-- Archives – Unified Schema Migration
-- Run this FRESH in: Supabase Dashboard > SQL Editor
-- (Drop tables first if you already ran a partial migration)
-- ══════════════════════════════════════════════════════════════

-- 0. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ══════════════════════════════════════════════════════════════
-- 1. Core academic structure
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,       -- e.g. "B.Tech CSE"
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.semesters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  number      INT NOT NULL,              -- 1..8
  label       TEXT,                      -- e.g. "Semester 3"
  UNIQUE (course_id, number)
);

-- ══════════════════════════════════════════════════════════════
-- 2. Papers table (exam PDFs)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.papers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id   UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,           -- e.g. "Data Structures"
  year          INT,                     -- e.g. 2023
  exam_type     TEXT,                    -- "midterm" | "endterm" | "retest"
  storage_path  TEXT NOT NULL,           -- Supabase Storage object path
  uploaded_by   UUID REFERENCES auth.users(id),
  ingested      BOOLEAN DEFAULT FALSE,
  chunk_count   INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- 3. Document chunks (RAG vectors)
--    Reference: papers(id) via paper_id
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id    UUID NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content     TEXT NOT NULL,
  embedding   VECTOR(768),               -- text-embedding-004 dimension
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx
  ON public.document_chunks
  USING hnsw (embedding vector_cosine_ops);

-- ══════════════════════════════════════════════════════════════
-- 4. Row Level Security
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- MVP: public read on academic content
CREATE POLICY "Public read courses"   ON public.courses         FOR SELECT USING (true);
CREATE POLICY "Public read semesters" ON public.semesters       FOR SELECT USING (true);
CREATE POLICY "Public read papers"    ON public.papers          FOR SELECT USING (true);
CREATE POLICY "Public read chunks"    ON public.document_chunks FOR SELECT USING (true);

-- Only uploader can insert papers
CREATE POLICY "Auth users insert papers"
  ON public.papers FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Only uploader can delete their papers
CREATE POLICY "Auth users delete papers"
  ON public.papers FOR DELETE
  USING (auth.uid() = uploaded_by);

-- ══════════════════════════════════════════════════════════════
-- 5. match_chunks RPC – vector similarity search
--    Called by the RAG service
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding  VECTOR(768),
  match_count      INT  DEFAULT 5,
  filter_paper_id  UUID DEFAULT NULL
)
RETURNS TABLE (
  id          UUID,
  paper_id    UUID,
  chunk_index INT,
  content     TEXT,
  similarity  FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    dc.id,
    dc.paper_id,
    dc.chunk_index,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE
    (filter_paper_id IS NULL OR dc.paper_id = filter_paper_id)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;
