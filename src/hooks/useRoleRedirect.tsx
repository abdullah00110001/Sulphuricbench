
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

export function useRoleRedirect() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Don't redirect if we're on the auth callback page
    if (window.location.pathname === '/auth/callback') {
      return
    }

    console.log('Role redirect check:', { loading, user: !!user, profile, role: profile?.role })
    
    if (loading) {
      console.log('Auth still loading, waiting...')
      return
    }

    // Skip redirection for super admin sessions
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
    const superAdminEmail = localStorage.getItem('superAdminEmail')
    
    if (isSuperAdmin && superAdminEmail) {
      console.log('Super admin session detected, skipping redirection')
      return
    }

    if (!user) {
      console.log('No user found, staying on current page')
      return
    }

    if (!profile) {
      console.log('User found but no profile, staying on current page')
      return
    }

    // Handle regular user role-based redirection only for non-super admin users
    switch (profile.role) {
      case 'super_admin':
        if (window.location.pathname !== '/super-admin') {
          console.log('Redirecting super admin to super dashboard')
          navigate('/super-admin', { replace: true })
        }
        break
      case 'student':
        // Only redirect if user is on auth pages or root, but allow access to student routes
        if (window.location.pathname === '/auth' || 
            (window.location.pathname === '/' && user)) {
          console.log('Redirecting student to student dashboard')
          navigate('/student/newdashboard', { replace: true })
        }
        break
      case 'teacher':
        console.log('Teacher role detected, staying on current page')
        // Teachers can access all pages, no redirect needed
        break
      default:
        console.log('Unknown role, no redirection')
    }
  }, [user, profile, loading, navigate, toast])

  return { loading }
}
