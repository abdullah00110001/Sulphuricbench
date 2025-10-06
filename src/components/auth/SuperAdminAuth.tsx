
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface SuperAdminAuthProps {
  onSuccess?: () => void
}

export function SuperAdminAuth({ onSuccess }: SuperAdminAuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting super admin login for:', email)
      
      const { error } = await signIn(email, password)

      if (error) {
        throw new Error(error.message || 'Invalid super admin credentials')
      }

      // Success - redirect to super admin dashboard
      setTimeout(() => {
        navigate('/super-admin')
      }, 1000)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Super admin login error:', error)
      setError(error.message || 'Super admin login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Super Admin Login</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Enter your super admin credentials</p>
      </div>

      <form onSubmit={handleSuperAdminLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="super-email">Email</Label>
          <Input
            id="super-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter super admin email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="super-password">Password</Label>
          <div className="relative">
            <Input
              id="super-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter super admin password"
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
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login as Super Admin
        </Button>
      </form>
    </div>
  )
}
