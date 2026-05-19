/**
 * AuthContext
 * ────────────
 * Single source of truth for auth state across the entire app.
 * Only ONE useAuth() hook instance runs here; everything else reads
 * from this context via useAuthContext().
 */
import { createContext, useContext } from 'react'
import { useAuth } from '@/hooks/useAuth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>')
  return ctx
}
