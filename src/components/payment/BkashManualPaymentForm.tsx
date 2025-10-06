import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Smartphone, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CouponField } from '@/components/coupons/CouponField'
import { Coupon } from '@/apis/coupons'

interface BkashManualPaymentFormProps {
  courseId: string
  courseTitle: string
  amount: number
  onSuccess: () => void
  onCancel: () => void
  bkashInstructions?: string
  merchantNumber?: string
}

export function BkashManualPaymentForm({
  courseId,
  courseTitle,
  amount,
  onSuccess,
  onCancel,
  bkashInstructions = "Please send money to our bKash merchant number and submit your transaction details below.",
  merchantNumber = "01309878503"
}: BkashManualPaymentFormProps) {
  const [fullName, setFullName] = useState('')
  const [bkashNumber, setBkashNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const finalAmount = amount - discountAmount

  const submitPaymentMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('manual_payments')
        .insert({
          user_id: user.user?.id,
          course_id: courseId,
          full_name: fullName,
          bkash_number: bkashNumber,
          transaction_id: transactionId,
          amount: finalAmount,
          payment_method: 'bkash_manual',
          status: 'pending'
        })

      if (error) throw error
    },
    onSuccess: () => {
      setIsSubmitted(true)
      queryClient.invalidateQueries({ queryKey: ['manual-payments'] })
      toast({
        title: 'Payment submitted',
        description: 'Your payment details have been submitted for review.'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim() || !bkashNumber.trim() || !transactionId.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    submitPaymentMutation.mutate()
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-600 dark:text-green-400">Payment Submitted</CardTitle>
          <CardDescription>
            Your payment is under review. You'll be notified after admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onSuccess} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-pink-600" />
          bKash Manual Payment
        </CardTitle>
        <CardDescription>
          Course: {courseTitle} • Amount: ৳{finalAmount}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>{bkashInstructions}</div>
            <div className="font-medium text-lg">
              Send money to: <span className="text-pink-600 font-bold">{merchantNumber}</span>
            </div>
          </AlertDescription>
        </Alert>

        <CouponField
          courseId={courseId}
          originalPrice={amount}
          onCouponApplied={(coupon, discount) => {
            setAppliedCoupon(coupon)
            setDiscountAmount(discount)
          }}
          appliedCoupon={appliedCoupon}
        />

        {discountAmount > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex justify-between text-sm">
              <span>Original Amount:</span>
              <span>৳{amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount:</span>
              <span className="text-green-600">-৳{discountAmount}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-green-200 dark:border-green-700 mt-2 pt-2">
              <span>Final Amount:</span>
              <span>৳{finalAmount}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bkashNumber">Your bKash Number *</Label>
            <Input
              id="bkashNumber"
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              placeholder="01XXXXXXXXX (যে নাম্বার থেকে টাকা পাঠানো হয়েছে)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID *</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter TRX ID from bKash SMS"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitPaymentMutation.isPending}
              className="flex-1"
            >
              {submitPaymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Payment'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}