
import { supabase } from '@/integrations/supabase/client'

export interface Coupon {
  id?: string
  code: string
  discount_percentage: number
  discount_type: 'percentage' | 'fixed'
  discount_amount?: number
  valid_from: string
  valid_until: string
  usage_limit: number
  usage_count?: number
  is_active: boolean
  applicable_courses?: string[] // Course IDs
  minimum_amount?: number
  description?: string
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface CouponUsage {
  id?: string
  coupon_id: string
  user_id: string
  course_id?: string
  used_at?: string
  discount_applied: number
}

export const couponsApi = {
  // Create a new coupon
  async createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...coupon,
        created_by: user.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all coupons (admin only)
  async getAllCoupons() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get active coupons (students can see these)
  async getActiveCoupons() {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)

    if (error) throw error
    return data || []
  },

  // Validate and get coupon by code
  async validateCoupon(code: string, courseId?: string) {
    const now = new Date().toISOString()
    
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .single()

    if (error || !coupon) {
      throw new Error('Invalid or expired coupon code')
    }

    // Check usage limit
    if (coupon.usage_count >= coupon.usage_limit) {
      throw new Error('Coupon usage limit exceeded')
    }

    // Check if coupon is applicable to the course
    if (courseId && coupon.applicable_courses && coupon.applicable_courses.length > 0) {
      if (!coupon.applicable_courses.includes(courseId)) {
        throw new Error('Coupon not applicable to this course')
      }
    }

    // Check if user has already used this coupon for this course
    const { data: user } = await supabase.auth.getUser()
    if (user.user) {
      const { data: usage } = await supabase
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.user.id)
        .eq('course_id', courseId || '')
        .single()

      if (usage) {
        throw new Error('You have already used this coupon for this course')
      }
    }

    return coupon
  },

  // Use coupon (increment usage count and create usage record)
  async useCoupon(couponId: string, courseId?: string, discountAmount: number = 0) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    // Create usage record
    const { error: usageError } = await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: couponId,
        user_id: user.user.id,
        course_id: courseId,
        discount_applied: discountAmount
      })

    if (usageError) throw usageError

    // Get current usage count and increment it
    const { data: currentCoupon, error: fetchError } = await supabase
      .from('coupons')
      .select('usage_count')
      .eq('id', couponId)
      .single()

    if (fetchError) throw fetchError

    const { error: updateError } = await supabase
      .from('coupons')
      .update({ usage_count: (currentCoupon.usage_count || 0) + 1 })
      .eq('id', couponId)

    if (updateError) throw updateError
  },

  // Update coupon
  async updateCoupon(couponId: string, updates: Partial<Coupon>) {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', couponId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete coupon
  async deleteCoupon(couponId: string) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId)

    if (error) throw error
  },

  // Get coupon usage history for a user
  async getUserCouponUsage(userId: string) {
    const { data, error } = await supabase
      .from('coupon_usage')
      .select(`
        *,
        coupons!inner(*),
        courses!inner(title)
      `)
      .eq('user_id', userId)
      .order('used_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Calculate discount
  calculateDiscount(coupon: Coupon, originalPrice: number): number {
    if (coupon.discount_type === 'percentage') {
      return Math.round((originalPrice * coupon.discount_percentage) / 100)
    } else {
      return Math.min(coupon.discount_amount || 0, originalPrice)
    }
  }
}
