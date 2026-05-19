/**
 * Query Service – RAG question answering
 * ─────────────────────────────────────────
 * POST /api/query
 */
import api from './api'

export const queryService = {
  /**
   * Ask a question against one or all ingested papers.
   * @param {string} question
   * @param {string|null} paperId   - null to search all papers
   * @param {Array<{role,content}>} chatHistory
   * @param {number} topK
   * @returns {{ answer: string, sources: Array, paper_id: string|null }}
   */
  async ask({ question, paperId = null, chatHistory = [], topK = 5 }) {
    const { data } = await api.post('/api/query', {
      question,
      paper_id: paperId,
      chat_history: chatHistory,
      top_k: topK,
    })
    return data
  },
}
