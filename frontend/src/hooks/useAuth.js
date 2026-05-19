/**
 * useAuth – global auth state hook
 * ──────────────────────────────────
 * Provides: user, session, loading, signIn, signUp, signOut, signInWithGoogle
 * Listens to Supabase auth state changes automatically.
 */
import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize from current session
    authService.getSession().then((s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    // Subscribe to future changes
    const subscription = authService.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email, password) => {
    setLoading(true)
    try {
      await authService.signIn(email, password)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    setLoading(true)
    try {
      await authService.signUp(email, password)
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle()
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
    setSession(null)
  }, [])

  return { user, session, loading, signIn, signUp, signOut, signInWithGoogle }
}
