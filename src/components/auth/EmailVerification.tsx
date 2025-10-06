
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

export function EmailVerification() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [canResend, setCanResend] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const email = searchParams.get('email') || ''

  useEffect(() => {
    if (!email) {
      navigate('/')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        if (prev === 540) { // Allow resend after 1 minute
          setCanResend(true)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, navigate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: {
          email: email,
          code: code
        }
      })

      if (error) throw error

      if (!data?.verified) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect or has expired",
          variant: "destructive",
        })
        setCode("")
        return
      }

      toast({
        title: "Email Verified! ✅",
        description: "Your account has been created successfully. You can now log in.",
      })

      // Redirect to login
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "An error occurred during verification",
        variant: "destructive",
      })
      setCode("")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email || !canResend) return

    setResending(true)
    try {
      // Generate new verification code
      const { data, error } = await supabase.functions.invoke('auth-signup', {
        body: {
          email: email,
          resendCode: true
        }
      })

      if (error) throw error

      toast({
        title: "Code Sent! 📧",
        description: "A new verification code has been sent to your email.",
      })

      setTimeLeft(600) // Reset timer
      setCanResend(false)
      setCode("") // Clear current code
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification code",
        variant: "destructive",
      })
    } finally {
      setResending(false)
    }
  }

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (code.length === 6) {
      handleVerify()
    }
  }, [code])

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-base mt-2">
              We've sent a 6-digit verification code to:<br />
              <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <label className="text-sm font-medium text-muted-foreground">
                Enter verification code
              </label>
            </div>
            
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={loading}
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index}
                      className="w-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="text-center text-sm">
            {timeLeft > 0 ? (
              <p className="text-muted-foreground">
                Code expires in <span className="font-mono font-semibold text-blue-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-red-600 font-medium">⏰ Code has expired</p>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Verifying...</span>
            </div>
          )}
          
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={!canResend || resending}
              className="w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : canResend ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              ) : (
                `Resend in ${Math.ceil((600 - timeLeft) / 60)}m`
              )}
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <Link 
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
