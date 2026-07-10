import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = still checking, null = signed out
  const [session, setSession] = useState(undefined)
  // undefined = not loaded yet, null = signed in but no profile row (no admin access)
  const [profile, setProfile] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session === undefined) return
    if (session === null) {
      setProfile(null)
      return
    }
    let active = true
    setProfile(undefined)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data ?? null)
      })
    return () => {
      active = false
    }
  }, [session])

  const value = {
    session,
    profile,
    // true while we don't yet know if the visitor may enter /admin
    checking: session === undefined || (session !== null && profile === undefined),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
