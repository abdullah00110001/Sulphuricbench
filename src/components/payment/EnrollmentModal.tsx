
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, CreditCard, Shield, CheckCircle, User, Phone, Mail, GraduationCap, X } from 'lucide-react'
import { CouponField } from '@/components/coupons/CouponField'
import { Coupon } from '@/apis/coupons'

interface EnrollmentModalProps {
  course: {
    id: string
    title: string
    price: number
    thumbnail_url?: string
    available_batches?: string[]
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: any) => void
}

interface FormData {
  name: string
  email: string
  phone: string
  institution: string
  batch: string
}

export function EnrollmentModal({ course, open, onOpenChange, onSuccess }: EnrollmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const { toast } = useToast()
  
  const finalAmount = course.price - discountAmount
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<FormData>()

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
              couponId: appliedCoupon?.id,
              discountAmount: discountAmount,
              ...data
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
        window.open(response.data.gateway_url, '_blank')
      } else {
        throw new Error('Payment gateway URL not received')
      }

      if (onSuccess) {
        onSuccess(response.data)
      }

      // Close modal and reset form
      onOpenChange(false)
      reset()

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Course Enrollment
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
            Complete your enrollment in 3 simple steps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">{course.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mt-1">
                  <span>Lifetime Access</span>
                  <span>•</span>
                  <span>Expert Support</span>
                </div>
              </div>
              <div className="text-right">
                {discountAmount > 0 && (
                  <div className="text-sm text-gray-500 line-through">৳{course.price}</div>
                )}
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">৳{finalAmount}</div>
                <div className="text-xs text-gray-500">One-time payment</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Please provide your details for enrollment</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Smart"
                    className="h-12"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
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
                    placeholder="smartbdtv30@gmail.com"
                    className="h-12"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    {...register('phone', { required: 'Phone number is required' })}
                    placeholder="Enter your phone number"
                    className="h-12"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-sm font-medium flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Institution
                  </Label>
                  <Input
                    id="institution"
                    {...register('institution')}
                    placeholder="School/College/University"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch" className="text-sm font-medium">Batch (Optional)</Label>
                  <Select onValueChange={(value) => setValue('batch', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {course.available_batches && course.available_batches.length > 0 ? (
                        course.available_batches.map((batch, index) => (
                          <SelectItem key={index} value={batch}>
                            {batch}
                          </SelectItem>
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
            </div>

            {/* Step 2: Apply Coupon */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-medium">Apply Discount</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Have a coupon code? Apply it here to get a discount</p>
                </div>
              </div>
              
              <CouponField
                courseId={course.id}
                originalPrice={course.price}
                onCouponApplied={(coupon, discount) => {
                  setAppliedCoupon(coupon)
                  setDiscountAmount(discount)
                }}
                appliedCoupon={appliedCoupon}
              />
            </div>

            {/* Step 3: Payment Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-medium">Payment Summary</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Review your payment details</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-300">Course Fee:</span>
                  <span className="font-semibold">৳{course.price}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-300">Discount ({appliedCoupon?.code}):</span>
                    <span className="font-semibold text-green-600">-৳{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-lg">Total Amount:</span>
                  <span className="font-bold text-xl text-green-600">৳{finalAmount}</span>
                </div>

                {/* Security Features */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-200">Secure Payment</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-4 h-4" />
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-4 h-4" />
                      <span>Secure Gateway</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-4 h-4" />
                      <span>Money Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-4 h-4" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-3 h-5 w-5" />
                  Proceed to Secure Payment
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                🔒 You will be redirected to SSLCommerz for secure payment processing
              </p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
