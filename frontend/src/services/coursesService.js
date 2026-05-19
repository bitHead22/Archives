/**
 * Courses & Semesters Service
 * ────────────────────────────
 * GET /api/courses
 * GET /api/courses/:id/semesters
 */
import api from './api'

export const coursesService = {
  /** Fetch all courses */
  async getCourses() {
    const { data } = await api.get('/api/courses')
    return data
  },

  /** Fetch semesters for a specific course */
  async getSemesters(courseId) {
    const { data } = await api.get(`/api/courses/${courseId}/semesters`)
    return data
  },
}
