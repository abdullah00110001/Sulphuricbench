import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Save, User } from 'lucide-react'

interface ProfileData {
  id: string
  full_name: string
  email: string
  role: 'student' | 'super_admin' | 'teacher' | 'admin'
}

export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['super-admin-profile'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileError) throw profileError

      const profileInfo = {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role
      }
      
      setProfileData(profileInfo)
      return profileInfo
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: Partial<ProfileData>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', profile?.id)

      if (error) throw error
      return updatedData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-profile'] })
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error
    },
    onSuccess: () => {
      setNewPassword('')
      setConfirmPassword('')
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Password update failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleProfileUpdate = () => {
    if (profileData) {
      updateProfileMutation.mutate({
        full_name: profileData.full_name,
        email: profileData.email
      })
    }
  }

  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive'
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      })
      return
    }

    updatePasswordMutation.mutate(newPassword)
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
        <p className="text-muted-foreground">
          Manage your admin profile and security settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profileData?.full_name || ''}
                onChange={(e) => setProfileData(prev => prev ? {...prev, full_name: e.target.value} : null)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData?.email || ''}
                onChange={(e) => setProfileData(prev => prev ? {...prev, email: e.target.value} : null)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profileData?.role || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <Button 
              onClick={handleProfileUpdate}
              disabled={updateProfileMutation.isPending}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Password Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Change your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
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

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <Button 
              onClick={handlePasswordUpdate}
              disabled={updatePasswordMutation.isPending || !newPassword || !confirmPassword}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}