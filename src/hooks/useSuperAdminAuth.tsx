import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
  bio?: string
}

interface SuperAdminAuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  updateProfile: (data: { full_name?: string; avatar_url?: string; bio?: string }) => Promise<boolean>
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined)

export const useSuperAdminAuth = () => {
  const context = useContext(SuperAdminAuthContext)
  if (!context) {
    throw new Error('useSuperAdminAuth must be used within SuperAdminAuthProvider')
  }
  return context
}

export const SuperAdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token from localStorage and verify on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('super_admin_token')
      if (savedToken) {
        const isValid = await verifyToken(savedToken)
        if (!isValid) {
          localStorage.removeItem('super_admin_token')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const verifyToken = async (tokenToVerify: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('super-admin-verify', {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      })

      if (error || !data?.valid) {
        setUser(null)
        setToken(null)
        return false
      }

      setUser(data.user)
      setToken(tokenToVerify)
      return true
    } catch (error) {
      console.error('Token verification failed:', error)
      setUser(null)
      setToken(null)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.functions.invoke('super-admin-login', {
        body: { email, password }
      })

      if (error || !data?.success) {
        console.error('Login failed:', error || data?.error)
        return false
      }

      const { token: newToken, user: userData } = data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('super_admin_token', newToken)
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await supabase.functions.invoke('super-admin-logout', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('super_admin_token')
      
      // Clear any other old auth data
      localStorage.removeItem('isSuperAdmin')
      localStorage.removeItem('superAdminEmail')
      localStorage.removeItem('simpleAuthUser')
    }
  }

  const updateProfile = async (data: { full_name?: string; avatar_url?: string; bio?: string }): Promise<boolean> => {
    if (!token) return false

    try {
      const { data: result, error } = await supabase.functions.invoke('super-admin-profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      })

      if (error || !result?.success) {
        console.error('Profile update failed:', error || result?.error)
        return false
      }

      setUser(result.user)
      return true
    } catch (error) {
      console.error('Profile update error:', error)
      return false
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
    updateProfile
  }

  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  )
}