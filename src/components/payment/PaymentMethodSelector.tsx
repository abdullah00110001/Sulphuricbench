
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Smartphone } from 'lucide-react'
import { EnrollmentModal } from './EnrollmentModal'
import { BkashManualPaymentForm } from './BkashManualPaymentForm'
import { usePaymentSettings } from '@/hooks/usePaymentSettings'

interface PaymentMethodSelectorProps {
  course: {
    id: string
    title: string
    price: number
    thumbnail_url?: string
    batches?: string[]
  }
  onSuccess?: (data?: any) => void
}

export function PaymentMethodSelector({ course, onSuccess }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'sslcommerz' | 'bkash' | null>(null)
  const { data: settings, isLoading } = usePaymentSettings()

  const handleSuccess = (data?: any) => {
    if (onSuccess) {
      onSuccess(data)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading payment options...</div>
  }

  if (!settings) {
    return <div className="text-center py-4 text-red-500">Failed to load payment settings</div>
  }

  // If only one method is enabled, show it directly
  const enabledMethods = [
    settings.sslcommerz_enabled && 'sslcommerz',
    settings.bkash_manual_enabled && 'bkash'
  ].filter(Boolean)

  if (enabledMethods.length === 1) {
    if (enabledMethods[0] === 'sslcommerz') {
      return (
        <EnrollmentModal
          course={course}
          open={true}
          onOpenChange={() => {}}
          onSuccess={handleSuccess}
        />
      )
    } else {
      return (
        <BkashManualPaymentForm
          courseId={course.id}
          courseTitle={course.title}
          amount={course.price}
          merchantNumber={settings.bkash_merchant_number}
          onSuccess={() => handleSuccess()}
          onCancel={() => {}}
        />
      )
    }
  }

  if (enabledMethods.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Unavailable</CardTitle>
          <CardDescription>
            No payment methods are currently available. Please contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Show method selection if both are enabled
  if (selectedMethod === null) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
          <CardDescription>
            Select your preferred payment method for "{course.title}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.sslcommerz_enabled && (
            <Button
              onClick={() => setSelectedMethod('sslcommerz')}
              variant="outline"
              className="w-full h-16 flex items-center justify-center gap-3"
            >
              <CreditCard className="w-6 h-6" />
              <div>
                <div className="font-medium">Online Payment</div>
                <div className="text-sm text-gray-500">Card, Mobile Banking, Net Banking</div>
              </div>
            </Button>
          )}
          
          {settings.bkash_manual_enabled && (
            <Button
              onClick={() => setSelectedMethod('bkash')}
              variant="outline"
              className="w-full h-16 flex items-center justify-center gap-3"
            >
              <Smartphone className="w-6 h-6" />
              <div>
                <div className="font-medium">bKash Manual</div>
                <div className="text-sm text-gray-500">Send money & submit TRX ID</div>
              </div>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Show selected payment method
  if (selectedMethod === 'sslcommerz') {
    return (
      <EnrollmentModal
        course={course}
        open={true}
        onOpenChange={() => setSelectedMethod(null)}
        onSuccess={handleSuccess}
      />
    )
  } else {
    return (
      <BkashManualPaymentForm
        courseId={course.id}
        courseTitle={course.title}
        amount={course.price}
        merchantNumber={settings.bkash_merchant_number}
        onSuccess={() => handleSuccess()}
        onCancel={() => setSelectedMethod(null)}
      />
    )
  }
}
