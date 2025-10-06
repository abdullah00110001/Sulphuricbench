
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...')
        
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast({
            title: "Authentication Error",
            description: error.message || "Failed to complete authentication",
            variant: "destructive",
          })
          navigate('/', { replace: true })
          return
        }

        if (data.session && data.session.user) {
          console.log('Auth callback successful for:', data.session.user.email)
          
          // Small delay to ensure session is properly set
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Fetch user profile to determine role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError)
            
            // If profile doesn't exist, create one
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email || '',
                full_name: data.session.user.user_metadata?.full_name || 
                          data.session.user.user_metadata?.name || 
                          data.session.user.email?.split('@')[0] || 'User',
                role: 'student',
                approval_status: 'approved'
              })

            if (insertError) {
              console.error('Profile creation error:', insertError)
              // Continue with default role
            }
          }

          // Get the final profile (either fetched or default)
          const userProfile = profile || {
            role: 'student',
            approval_status: 'approved'
          }

          console.log('User profile:', userProfile)

          toast({
            title: "Login Successful",
            description: "Welcome! Redirecting to your dashboard...",
          })

          // Role-based redirection with explicit navigation
          setTimeout(() => {
            switch (userProfile.role) {
              case 'super_admin':
                console.log('Redirecting to super admin dashboard')
                navigate('/super-admin', { replace: true })
                break
              case 'teacher':
                console.log('Redirecting to student dashboard (teacher approved)')
                navigate('/student/dashboard', { replace: true })
                break
              case 'student':
              default:
                console.log('Redirecting to student dashboard')
                navigate('/student/dashboard', { replace: true })
                break
            }
          }, 1000)
        } else {
          console.log('No session found, redirecting to home')
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Auth callback processing error:', error)
        toast({
          title: "Authentication Error",
          description: "Failed to complete authentication. Please try again.",
          variant: "destructive",
        })
        navigate('/', { replace: true })
      } finally {
        setIsProcessing(false)
      }
    }

    handleAuthCallback()
  }, [navigate, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Completing Sign In...</h2>
          <p className="text-muted-foreground">
            {isProcessing ? "Processing your authentication..." : "Redirecting..."}
          </p>
        </div>
      </div>
    </div>
  )
}
