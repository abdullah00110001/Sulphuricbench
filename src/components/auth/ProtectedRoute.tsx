
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: 'super_admin' | 'student'
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { user, profile, loading, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[PROTECTED] ProtectedRoute check:', { 
      requiredRole, 
      isSuperAdmin, 
      user: !!user, 
      userEmail: user?.email,
      profile: profile ? { role: profile.role } : null, 
      loading 
    })
    
    // For super admin routes - keep it simple
    if (requiredRole === 'super_admin') {
      if (loading) {
        console.log('[PROTECTED] Super admin loading...')
        return
      }
      
      const isSuperAdminStored = localStorage.getItem('isSuperAdmin') === 'true'
      
      console.log('[PROTECTED] Super admin check - isSuperAdmin:', isSuperAdmin, 'localStorage:', isSuperAdminStored)
      
      if (isSuperAdmin || isSuperAdminStored) {
        console.log('[PROTECTED] Super admin access granted')
        setIsAuthorized(true)
        setError(null)
        return
      } else {
        console.log('[PROTECTED] Super admin access denied')
        setError('Please log in as super admin to access this page.')
        setTimeout(() => navigate('/auth'), 2000)
        return
      }
    }

    // For regular user routes - CRITICAL: Don't wait for loading if we have user
    if (!user) {
      if (loading) {
        console.log('[PROTECTED] No user and still loading - waiting...')
        return
      }
      console.log('[PROTECTED] No user and not loading - redirecting to auth')
      setError('Please log in to access this page.')
      setTimeout(() => navigate('/auth'), 2000)
      return
    }

    // We have a user - proceed with role checks
    console.log('[PROTECTED] User found, checking roles...')

    // Check user role for regular users
    if (requiredRole === 'student') {
      // Allow both student and teacher roles to access student dashboard
      if (!profile) {
        if (loading) {
          console.log('[PROTECTED] User exists, profile loading, waiting a bit more...')
          // Set a timeout to stop waiting for profile if it takes too long
          setTimeout(() => {
            if (!profile && user) {
              console.log('[PROTECTED] Profile timeout - allowing access anyway')
              setIsAuthorized(true)
              setError(null)
            }
          }, 3000) // 3 second timeout for profile
          return
        } else {
          console.log('[PROTECTED] User exists, no profile, not loading - allowing access')
          setIsAuthorized(true)
          setError(null)
          return
        }
      }
      
      // If we have a profile, check the role
      if (profile && profile.role !== 'student' && profile.role !== 'teacher') {
        console.log('[PROTECTED] User has profile but wrong role:', profile.role)
        setError(`Access denied. Student or teacher account required.`)
        setTimeout(() => navigate('/auth'), 2000)
        return
      }
      
      console.log('[PROTECTED] Student access granted - user authenticated with proper role')
      setIsAuthorized(true)
      setError(null)
      return
      
    } else if (profile && profile.role !== requiredRole) {
      console.log('[PROTECTED] Wrong role for required role:', { required: requiredRole, actual: profile.role })
      setError(`Access denied. ${requiredRole} role required.`)
      setTimeout(() => navigate(redirectTo), 2000)
      return
    }

    // Default: if we have user, allow access
    console.log('[PROTECTED] Default case - user exists, allowing access')
    setIsAuthorized(true)
    setError(null)
  }, [user, profile, loading, requiredRole, navigate, redirectTo, isSuperAdmin])

  // Show loading only for regular users
  if (loading && requiredRole !== 'super_admin' && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => navigate(redirectTo)}
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthorized) {
    return <>{children}</>
  }

  return null
}
