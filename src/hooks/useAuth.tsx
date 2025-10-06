import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'student' | 'teacher' | 'admin' | 'super_admin'
  approval_status: 'pending' | 'approved' | 'rejected'
  email_verified: boolean
  phone?: string
  bio?: string
  points?: number
  level?: number
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Initializing auth...')
        
        // Check for super admin session (SIMPLE CHECK)
        const isSuperAdminStored = localStorage.getItem('isSuperAdmin') === 'true'
        const superAdminEmail = localStorage.getItem('superAdminEmail')
        
        if (isSuperAdminStored && superAdminEmail) {
          console.log('[AUTH] Super admin session found:', superAdminEmail)
          
          // Create simple mock user for super admin
          const mockUser = {
            id: 'super-admin-user',
            email: superAdminEmail,
            aud: 'authenticated',
            role: 'authenticated',
          } as User

          const mockProfile = {
            id: 'super-admin-user',
            email: superAdminEmail,
            full_name: 'Super Admin',
            role: 'super_admin' as const,
            approval_status: 'approved' as const,
            email_verified: true,
            points: 0,
            level: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          console.log('[AUTH] Setting super admin user and profile, loading to false')
          setUser(mockUser)
          setProfile(mockProfile)
          setIsSuperAdmin(true)
          setLoading(false)
          return
        }

        // Regular Supabase auth check with retry mechanism
        console.log('[AUTH] Checking for regular user session...')
        let session = null
        let retries = 3
        
        while (retries > 0 && !session) {
          try {
            const { data } = await supabase.auth.getSession()
            session = data.session
            if (!session && retries > 1) {
              console.log('[AUTH] Session not found, retrying...')
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          } catch (error) {
            console.error('[AUTH] Session fetch error:', error)
          }
          retries--
        }
        
        if (session?.user) {
          console.log('[AUTH] Regular user session found:', session.user.email)
          setUser(session.user)
          setSession(session)
          
          // Fetch user profile with retry mechanism
          let profile = null
          let profileRetries = 3
          
          while (profileRetries > 0 && !profile) {
            try {
              console.log('[AUTH] Fetching user profile... (attempt', 4 - profileRetries, ')')
              
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle()
              
              if (error) {
                console.error('[AUTH] Profile fetch error:', error)
                if (profileRetries > 1) {
                  await new Promise(resolve => setTimeout(resolve, 1000))
                }
              } else if (data) {
                profile = data
                console.log('[AUTH] Profile fetched successfully:', profile.role)
                setProfile(profile)
                setIsSuperAdmin(profile.role === 'super_admin')
              } else {
                console.log('[AUTH] No profile found')
                setProfile(null)
                break
              }
            } catch (profileError) {
              console.error('[AUTH] Profile fetch exception:', profileError)
              if (profileRetries > 1) {
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            }
            profileRetries--
          }
          
          // If no profile found after retries, set null
          if (!profile) {
            setProfile(null)
          }
          
          console.log('[AUTH] User authenticated, setting loading to false')
          setLoading(false)
        } else {
          console.log('[AUTH] No session found, setting loading to false')
          setUser(null)
          setSession(null)
          setProfile(null)
          setIsSuperAdmin(false)
          setLoading(false)
        }
        
      } catch (error) {
        console.error('[AUTH] Auth initialization error:', error)
        // Set defaults on error
        setUser(null)
        setSession(null)
        setProfile(null)
        setIsSuperAdmin(false)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes with better error handling
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('[AUTH] Auth state changed:', event, newSession?.user?.email)

      // Always set session and user synchronously to avoid deadlocks
      setSession(newSession || null)
      setUser(newSession?.user ?? null)

      const isSuperAdminStored = localStorage.getItem('isSuperAdmin') === 'true'

      if (!newSession?.user) {
        if (!isSuperAdminStored && event !== 'TOKEN_REFRESHED') {
          console.log('[AUTH] Clearing auth state - no session')
          setProfile(null)
          setIsSuperAdmin(false)
          setLoading(false)
        }
        return
      }

      // Defer Supabase calls outside the callback per best practices
      setTimeout(() => {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .maybeSingle()
          .then(({ data: prof, error }) => {
            if (error) {
              console.error('[AUTH] Profile fetch error in auth change:', error)
              setProfile(null)
            } else {
              setProfile(prof || null)
              setIsSuperAdmin((prof?.role || '') === 'super_admin')
            }
            setLoading(false)
          })
      }, 0)
    })

    // Set up session refresh to prevent timeouts (less frequent to avoid issues)
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('[AUTH] Session refreshed automatically')
        } else {
          // If no session and not super admin, clear state to prevent blank screens
          const isSuperAdminStored = localStorage.getItem('isSuperAdmin') === 'true'
          if (!isSuperAdminStored) {
            console.log('[AUTH] No session found during refresh, clearing state')
            setUser(null)
            setProfile(null)
            setSession(null)
            setIsSuperAdmin(false)
          }
        }
      } catch (error) {
        console.error('[AUTH] Session refresh error:', error)
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes instead of 5

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        return { error }
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profile) {
          setProfile(profile)
          setIsSuperAdmin(profile.role === 'super_admin')
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        return { error }
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      // Clear super admin session
      localStorage.removeItem('isSuperAdmin')
      localStorage.removeItem('superAdminEmail')
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      setUser(null)
      setSession(null)
      setProfile(null)
      setIsSuperAdmin(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isSuperAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}