/**
 * usePapers – list, upload, and delete papers
 */
import { useState, useEffect, useCallback } from 'react'
import { papersService } from '@/services/papersService'

export function usePapers(semesterId = null) {
  const [papers, setPapers]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetchPapers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await papersService.getPapers(semesterId)
      setPapers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [semesterId])

  useEffect(() => { fetchPapers() }, [fetchPapers])

  const uploadPaper = useCallback(async (file, meta, userId) => {
    setLoading(true)
    setError(null)
    try {
      const result = await papersService.uploadAndIngest(file, meta, userId)
      await fetchPapers() // refresh list
      return result
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [fetchPapers])

  const deletePaper = useCallback(async (paperId) => {
    setError(null)
    try {
      await papersService.deletePaper(paperId)
      setPapers((prev) => prev.filter((p) => p.id !== paperId))
    } catch (e) {
      setError(e.message)
      throw e
    }
  }, [])

  return { papers, loading, error, uploadPaper, deletePaper, refetch: fetchPapers }
}
