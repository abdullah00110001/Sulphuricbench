
import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw, ArrowLeft } from 'lucide-react'

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams()
  const tran_id = searchParams.get('tran_id')
  const error_message = searchParams.get('error')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
            <p className="text-lg text-gray-600 mb-6">
              You have cancelled the payment process.
            </p>

{ (tran_id || error_message) && (
  <div className="bg-yellow-50 rounded-lg p-6 mb-6 text-left">
    <h3 className="font-semibold text-lg mb-2 text-yellow-800">Payment details</h3>
    {tran_id && (
      <p className="text-sm text-yellow-700">
        Transaction ID: <span className="font-mono">{tran_id}</span>
      </p>
    )}
    {error_message && (
      <p className="text-sm text-yellow-700 mt-2">Reason: {error_message}</p>
    )}
  </div>
)}
<div className="bg-yellow-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-lg mb-4 text-yellow-800">What's next?</h3>
              <div className="text-yellow-700 space-y-2">
                <p>• Your enrollment has not been completed</p>
                <p>• No charges have been made to your account</p>
                <p>• You can retry the payment anytime</p>
                <p>• Your course selection has been saved</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Try Payment Again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/courses">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Browse Other Courses
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Homepage
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team and we'll assist you with the enrollment process.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
