/**
 * useQuery – RAG question answering with chat history
 */
import { useState, useCallback, useRef } from 'react'
import { queryService } from '@/services/queryService'

export function useQuery(paperId = null) {
  const [messages, setMessages] = useState([])  // { role, content }
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  // Keep a ref for the latest chat history to pass to the API
  const historyRef = useRef([])

  const ask = useCallback(async (question, overridePaperId) => {
    if (!question.trim()) return

    const userMsg = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    historyRef.current = [...historyRef.current, userMsg]

    setLoading(true)
    setError(null)

    try {
      const result = await queryService.ask({
        question,
        paperId: overridePaperId ?? paperId,
        chatHistory: historyRef.current.slice(0, -1), // exclude current question
        topK: 5,
      })

      const assistantMsg = {
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
      }
      setMessages((prev) => [...prev, assistantMsg])
      historyRef.current = [...historyRef.current, assistantMsg]

      return result
    } catch (e) {
      setError(e.message)
      const errMsg = { role: 'assistant', content: `Error: ${e.message}`, isError: true }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [paperId])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    historyRef.current = []
  }, [])

  return { messages, loading, error, ask, clearChat }
}
