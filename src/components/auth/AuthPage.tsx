
import React, { useState } from 'react'
import { AuthForm } from './AuthForm'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  const handleAuthSuccess = () => {
    // Add a small delay to ensure auth state is properly set
    setTimeout(() => {
      // Redirect to the original URL or home page after successful auth
      navigate(redirectUrl || '/')
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Go back to the redirect URL or home if no history
              if (redirectUrl) {
                navigate(redirectUrl)
              } else if (window.history.length > 1) {
                navigate(-1)
              } else {
                navigate('/')
              }
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to Sulphuric Bench
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to enroll in courses and track your progress
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-6">
                <AuthForm mode="login" onSuccess={handleAuthSuccess} />
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <AuthForm mode="signup" onSuccess={handleAuthSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
