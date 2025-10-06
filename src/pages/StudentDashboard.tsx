
import { useAuth } from "@/hooks/useAuth"
import { UnifiedStudentDashboard } from "@/components/UnifiedStudentDashboard"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function StudentDashboard() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  console.log('StudentDashboard render:', { user: !!user, profile: !!profile, loading })

  // Handle authentication with better error recovery
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to auth')
      const timer = setTimeout(() => {
        navigate('/auth')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, loading, navigate])

  // Add session check to prevent blank screens
  useEffect(() => {
    const checkSession = async () => {
      if (!loading && user) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            console.log('No valid session, redirecting to auth')
            navigate('/auth')
          }
        } catch (error) {
          console.error('Session check error:', error)
          navigate('/auth')
        }
      }
    }

    checkSession()
  }, [user, loading, navigate])

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">This should only take a few seconds</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <UnifiedStudentDashboard />
    </div>
  )
}
