
import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { CheckCircle, Loader2, Download, Home, BookOpen } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [isValidating, setIsValidating] = useState(true)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validatePayment = async () => {
      try {
        const val_id = searchParams.get('val_id')
        const tran_id = searchParams.get('tran_id')
        
        if (!val_id || !tran_id) {
          throw new Error('Missing payment validation parameters')
        }

        console.log('Validating payment:', { val_id, tran_id })

        const { data: response, error } = await supabase.functions.invoke(
          'sslcommerz-payment',
          {
            body: {
              action: 'validate_payment',
              data: { val_id }
            }
          }
        )

        if (error) {
          throw error
        }

        if (response.error) {
          throw new Error(response.error)
        }

        setValidationResult(response.data)
        
        toast({
          title: "Payment Successful!",
          description: "Your enrollment has been completed successfully.",
        })

      } catch (error: any) {
        console.error('Payment validation error:', error)
        setError(error.message || 'Failed to validate payment')
        
        toast({
          title: "Validation Error",
          description: error.message || "Unable to validate payment. Please contact support.",
          variant: "destructive"
        })
      } finally {
        setIsValidating(false)
      }
    }

    validatePayment()
  }, [searchParams, toast])

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Validating Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-800">Validation Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/">Go to Homepage</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your enrollment has been completed successfully.
            </p>

            {validationResult && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono">{validationResult.payment?.transaction_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">৳{validationResult.payment?.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-semibold">Completed</span>
                  </div>
                  {validationResult.invoice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice:</span>
                      <span className="font-mono">{validationResult.invoice.invoice_number}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/student/dashboard">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Go to My Courses
                </Link>
              </Button>
              
              {validationResult?.invoice && (
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to={`/invoice/${validationResult.invoice.id}`}>
                    <Download className="mr-2 h-5 w-5" />
                    Download Invoice
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="ghost" className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Homepage
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                You will receive a confirmation email shortly with your course access details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
