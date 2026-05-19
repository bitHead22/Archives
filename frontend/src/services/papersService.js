/**
 * Papers Service
 * ───────────────
 * GET    /api/papers?semester_id=...  → list papers
 * GET    /api/papers/:id              → get single paper
 * DELETE /api/papers/:id              → delete paper
 * POST   /api/ingest/:paper_id        → upload + ingest PDF
 *
 * Upload flow:
 * 1. Upload PDF to Supabase Storage
 * 2. Insert paper record into `papers` table (via Supabase client)
 * 3. POST to /api/ingest/:paper_id (backend embeds + stores chunks)
 */
import api from './api'
import { supabase } from '@/lib/supabase'

const STORAGE_BUCKET = 'papers'

export const papersService = {
  /** List papers, optionally filtered by semester */
  async getPapers(semesterId = null) {
    const params = semesterId ? { semester_id: semesterId } : {}
    const { data } = await api.get('/api/papers', { params })
    return data
  },

  /** Get single paper metadata */
  async getPaper(paperId) {
    const { data } = await api.get(`/api/papers/${paperId}`)
    return data
  },

  /** Delete a paper (chunks cascade) */
  async deletePaper(paperId) {
    await api.delete(`/api/papers/${paperId}`)
  },

  /**
   * Full upload + ingest flow:
   * 1. Store PDF in Supabase Storage
   * 2. Create paper DB record
   * 3. Trigger backend RAG ingest
   * @param {File} file
   * @param {{ semesterId, subject, year, examType }} meta
   * @param {string} userId
   */
  async uploadAndIngest(file, { semesterId, subject, year, examType }, userId) {
    // 1. Upload to Storage
    const storagePath = `${userId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: 'application/pdf', upsert: false })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    // 2. Insert paper record
    const { data: paper, error: insertError } = await supabase
      .from('papers')
      .insert({
        semester_id: semesterId,
        subject,
        year: year ? Number(year) : null,
        exam_type: examType,
        storage_path: storagePath,
        uploaded_by: userId,
        ingested: false,
      })
      .select()
      .single()

    if (insertError) throw new Error(`DB insert failed: ${insertError.message}`)

    // 3. Trigger backend ingest (embed + store chunks)
    const formData = new FormData()
    formData.append('file', file)

    const { data: ingestResult } = await api.post(
      `/api/ingest/${paper.id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    return { paper, ingestResult }
  },

  /** Get a signed download URL for a paper's PDF */
  async getDownloadUrl(paperId) {
    const { data } = await api.get(`/api/papers/${paperId}/download-url`)
    return data.url
  },
}
