
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { CouponField } from '@/components/coupons/CouponField'
import { Coupon } from '@/apis/coupons'

interface EnrollmentFormProps {
  course: {
    id: string
    title: string
    price: number
    thumbnail_url?: string
    batches?: string[]
  }
  onSuccess?: (data: any) => void
}

interface FormData {
  name: string
  email: string
  phone: string
  institution: string
  batch: string
}

export function EnrollmentForm({ course, onSuccess }: EnrollmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const { toast } = useToast()
  const { user } = useAuth()

  const finalAmount = course.price - discountAmount
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>()

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setValue('name', user.user_metadata?.full_name || '')
      setValue('email', user.email || '')
    }
  }, [user, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      
      console.log('Submitting enrollment:', data)

      const { data: response, error } = await supabase.functions.invoke(
        'sslcommerz-payment',
        {
          body: {
            action: 'create_enrollment',
            data: {
              courseId: course.id,
              ...data,
              couponId: appliedCoupon?.id,
              discountAmount: discountAmount
            }
          }
        }
      )

      if (error) {
        throw error
      }

      if (response.error) {
        throw new Error(response.error)
      }

      console.log('Enrollment created:', response.data)

      // Redirect to SSLCommerz payment gateway
      if (response.data.gateway_url) {
        window.location.href = response.data.gateway_url
      } else {
        throw new Error('Payment gateway URL not received')
      }

      if (onSuccess) {
        onSuccess(response.data)
      }

    } catch (error: any) {
      console.error('Enrollment error:', error)
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to create enrollment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Course Enrollment</CardTitle>
        <CardDescription>
          Complete your enrollment for "{course.title}" - ৳{finalAmount}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CouponField
            courseId={course.id}
            originalPrice={course.price}
            onCouponApplied={(coupon, discount) => {
              setAppliedCoupon(coupon)
              setDiscountAmount(discount)
            }}
            appliedCoupon={appliedCoupon}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^(\+880|880|0)?1[3-9]\d{8}$/,
                    message: 'Please enter a valid Bangladeshi mobile number (e.g., 01XXXXXXXX)'
                  }
                })}
                placeholder="01XXXXXXXX"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                {...register('institution')}
                placeholder="School/College/University"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="batch">Batch (Optional)</Label>
              <Select onValueChange={(value) => setValue('batch', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your batch" />
                </SelectTrigger>
                <SelectContent>
                  {course.batches && course.batches.length > 0 ? (
                    course.batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Payment Summary</h3>
            <div className="flex justify-between items-center">
              <span>Course Fee:</span>
              <span className="font-semibold">৳{course.price}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Discount:</span>
                <span className="font-semibold">-৳{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-bold text-lg">৳{finalAmount}</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>

          <p className="text-sm text-gray-600 text-center">
            You will be redirected to SSLCommerz for secure payment processing.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
