/**
 * useCourses – fetch all courses + semesters for a selected course
 */
import { useState, useEffect } from 'react'
import { coursesService } from '@/services/coursesService'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    coursesService.getCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { courses, loading, error }
}

export function useSemesters(courseId) {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!courseId) { setSemesters([]); return }
    setLoading(true)
    coursesService.getSemesters(courseId)
      .then(setSemesters)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [courseId])

  return { semesters, loading, error }
}
