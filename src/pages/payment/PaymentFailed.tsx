
import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Home, RefreshCw, MessageCircle } from 'lucide-react'

export default function PaymentFailed() {
  const [searchParams] = useSearchParams()
  const tran_id = searchParams.get('tran_id')
  const error_message = searchParams.get('error') || 'Payment processing failed'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-lg text-gray-600 mb-6">
              Unfortunately, your payment could not be processed.
            </p>

            <div className="bg-red-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-lg mb-4 text-red-800">What happened?</h3>
              <p className="text-red-700 mb-4">{error_message}</p>
              
              {tran_id && (
                <div className="text-sm">
                  <span className="text-gray-600">Transaction ID: </span>
                  <span className="font-mono">{tran_id}</span>
                </div>
              )}
              
              <div className="mt-4 text-sm text-red-600">
                <p>Common reasons for payment failure:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Insufficient funds in your account</li>
                  <li>Card expired or blocked</li>
                  <li>Network connectivity issues</li>
                  <li>Bank security restrictions</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Try Again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/contact">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contact Support
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
                If you continue to experience issues, please contact our support team for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
