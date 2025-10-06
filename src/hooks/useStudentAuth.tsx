
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useNavigate } from 'react-router-dom'

export function useStudentAuth() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return

    console.log('Student auth check:', { user: user?.email, role: profile?.role })

    if (!user) {
      setAuthError('Please log in to access your dashboard')
      setIsAuthorized(false)
      return
    }

    if (!profile) {
      setAuthError('Loading your profile...')
      setIsAuthorized(false)
      return
    }

    // Allow both student and teacher roles to access student dashboard
    if (profile.role !== 'student' && profile.role !== 'teacher') {
      setAuthError('Access denied. Student or teacher role required.')
      setIsAuthorized(false)
      return
    }

    setIsAuthorized(true)
    setAuthError(null)
  }, [user, profile, loading, navigate])

  return { isAuthorized, authError, loading }
}
