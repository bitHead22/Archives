/**
 * Axios base client
 * ──────────────────
 * - Reads VITE_API_URL from .env.local
 * - Attaches the Supabase user ID to every request via x-user-id header
 * - Handles errors globally and normalizes them
 */
import axios from 'axios'
import { supabase } from '@/lib/supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeout: 60_000, // 60s for large PDF ingest
})

// ── Request interceptor: attach user id ──────────────────────
api.interceptors.request.use(async (config) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id) {
    config.headers['x-user-id'] = user.id
  }
  return config
})

// ── Response interceptor: normalize errors ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api
