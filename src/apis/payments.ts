import { supabase } from '@/integrations/supabase/client'

export interface PaymentData {
  course_id: string
  amount: number
  original_amount?: number
  discount_amount?: number
  coupon_code?: string
  coupon_id?: string
  payment_method: string
  phone_number?: string
}

export interface EnrollmentData {
  courseId: string
  name: string
  email: string
  phone: string
  institution?: string
  batch?: string
  couponId?: string
  discountAmount?: number
}

export interface BkashPaymentData {
  course_id: string
  full_name: string
  email: string
  phone: string
  institution?: string
  batch?: string
  bkash_number: string
  transaction_id: string
  amount: number
}

export const paymentsApi = {
  // Create SSLCommerz enrollment
  async createEnrollment(enrollmentData: EnrollmentData) {
    const authHeader = await getAuthHeader()
    
    const response = await fetch('/functions/v1/sslcommerz-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        action: 'create_enrollment',
        data: enrollmentData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Enrollment creation failed')
    }

    return await response.json()
  },

  // Submit bKash manual payment
  async submitBkashPayment(paymentData: BkashPaymentData) {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Insert directly into manual_payments table
    const { error } = await supabase
      .from('manual_payments')
      .insert({
        user_id: user?.id,
        course_id: paymentData.course_id,
        full_name: paymentData.full_name,
        bkash_number: paymentData.bkash_number,
        transaction_id: paymentData.transaction_id,
        amount: paymentData.amount,
        payment_method: 'bkash_manual',
        status: 'pending'
      })

    if (error) throw error
    return { success: true }
  },

  // Create payment with coupon support
  async createPayment(paymentData: PaymentData) {
    const authHeader = await getAuthHeader()
    
    const response = await fetch('/functions/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        action: 'create_payment',
        data: paymentData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Payment creation failed')
    }

    return await response.json()
  },

  // Check payment status
  async checkPaymentStatus(paymentId: string) {
    const authHeader = await getAuthHeader()
    
    const response = await fetch('/functions/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        action: 'check_payment_status',
        data: { paymentId }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to check payment status')
    }

    return await response.json()
  },

  // Get payment history
  async getPaymentHistory() {
    const authHeader = await getAuthHeader()
    
    const response = await fetch('/functions/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        action: 'get_payment_history',
        data: {}
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get payment history')
    }

    return await response.json()
  },

  // Get admin payments
  async getAdminPayments() {
    const authHeader = await getAuthHeader()
    
    const response = await fetch('/functions/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        action: 'get_admin_payments',
        data: {}
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get admin payments')
    }

    return await response.json()
  }
}

async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  return `Bearer ${session?.access_token || ''}`
}