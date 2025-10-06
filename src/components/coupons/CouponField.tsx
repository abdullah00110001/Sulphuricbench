
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Percent, X, Loader2 } from 'lucide-react'
import { couponsApi, Coupon } from '@/apis/coupons'
import { useToast } from '@/hooks/use-toast'

interface CouponFieldProps {
  courseId?: string
  originalPrice: number
  onCouponApplied: (coupon: Coupon | null, discountAmount: number) => void
  appliedCoupon?: Coupon | null
}

export function CouponField({ courseId, originalPrice, onCouponApplied, appliedCoupon }: CouponFieldProps) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a coupon code.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const couponData = await couponsApi.validateCoupon(couponCode.trim(), courseId)
      
      // Type cast the discount_type to ensure it matches our interface
      const coupon: Coupon = {
        ...couponData,
        discount_type: couponData.discount_type as 'percentage' | 'fixed'
      }
      
      // Check minimum amount if specified
      if (coupon.minimum_amount && originalPrice < coupon.minimum_amount) {
        throw new Error(`Minimum order amount of ৳${coupon.minimum_amount} required for this coupon`)
      }

      const discountAmount = couponsApi.calculateDiscount(coupon, originalPrice)
      
      onCouponApplied(coupon, discountAmount)
      
      toast({
        title: "Coupon Applied!",
        description: `You saved ৳${discountAmount} with coupon ${coupon.code}`,
      })
      
      setCouponCode('')
    } catch (error: any) {
      console.error('Error applying coupon:', error)
      toast({
        title: "Invalid Coupon",
        description: error.message || "This coupon is not valid or has expired.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    onCouponApplied(null, 0)
    setCouponCode('')
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your order.",
    })
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/20">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Have a coupon code?</span>
          </div>

          {appliedCoupon ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {appliedCoupon.code}
                  </Badge>
                  <div className="text-sm">
                    <div className="font-medium text-green-800 dark:text-green-200">
                      {appliedCoupon.discount_type === 'percentage' 
                        ? `${appliedCoupon.discount_percentage}% OFF` 
                        : `৳${appliedCoupon.discount_amount} OFF`
                      }
                    </div>
                    {appliedCoupon.description && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {appliedCoupon.description}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                disabled={loading}
                className="text-center font-mono"
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                className="px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
