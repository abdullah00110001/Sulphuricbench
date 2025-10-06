
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSuccess?: () => void
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  // Super admin credentials - WORKING PASSWORDS
  const superAdminCredentials = [
    { email: 'abdullahusimin1@gmail.com', password: '@abdullah1', name: 'Abdullah Usimin' },
    { email: 'stv7168@gmail.com', password: '12345678', name: 'STV Admin' },
    { email: 'abdullahabeer003@gmail.com', password: '12345678', name: 'Abdullah Abeer' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if this is a super admin login attempt
      const superAdminCred = superAdminCredentials.find(cred => cred.email === email)
      
      if (superAdminCred && password === superAdminCred.password) {
        // Handle super admin login
        console.log('Super admin login for:', email)
        
        // Store super admin session info
        localStorage.setItem('isSuperAdmin', 'true')
        localStorage.setItem('superAdminEmail', email)
        localStorage.setItem('superAdminName', superAdminCred.name)
        localStorage.setItem('superAdminLoginTime', Date.now().toString())

        toast({
          title: "Super Admin Login Successful",
          description: `Welcome ${superAdminCred.name}! Redirecting to dashboard...`,
        })

        // Force page reload to trigger auth context update
        setTimeout(() => {
          window.location.href = '/super-admin'
        }, 1000)

        if (onSuccess) {
          onSuccess()
        }
        return
      }

      // Regular user authentication
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
          }
        })

        if (error) {
          throw error
        }

        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account.",
        })
      } else {
        console.log('Attempting regular user login for:', email)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          console.error('Regular login error:', error)
          throw error
        }

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        })

        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'An unexpected error occurred')
      toast({
        title: "Authentication Failed",
        description: error.message || 'Please check your credentials and try again',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Attempting Google sign in...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google sign in error:', error)
        throw error
      }

      console.log('Google sign in initiated:', data)
    } catch (error: any) {
      console.error('Google sign in error:', error)
      setError(error.message || 'Failed to sign in with Google')
      toast({
        title: "Google Sign In Failed",
        description: error.message || 'Please try again or contact support',
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </form>
    </div>
  )
}
