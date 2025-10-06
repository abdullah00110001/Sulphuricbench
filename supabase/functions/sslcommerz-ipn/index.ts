
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('IPN received:', req.method)
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse form data
    const formData = await req.formData()
    const ipnData: Record<string, string> = {}
    
    for (const [key, value] of formData.entries()) {
      ipnData[key] = value.toString()
    }

    console.log('IPN Data received:', ipnData)

    const { status, tran_id, val_id, amount, currency } = ipnData

    if (status === 'VALID') {
      console.log('Processing valid payment:', tran_id)

      // Check if coupon was used and track usage
      const couponId = ipnData.value_d // coupon_id stored in value_d
      if (couponId && couponId !== '') {
        console.log('Processing coupon usage for coupon:', couponId)
        
        // Get the payment details first to determine discount
        const { data: currentPayment } = await supabaseClient
          .from('payments_v2')
          .select('user_id, course_id, amount')
          .eq('transaction_id', tran_id)
          .single()

        if (currentPayment) {
          // Create coupon usage record
          const { error: couponUsageError } = await supabaseClient
            .from('coupon_usage')
            .insert({
              coupon_id: couponId,
              user_id: currentPayment.user_id,
              course_id: currentPayment.course_id,
              discount_applied: parseFloat(amount) - currentPayment.amount
            })
          
          if (couponUsageError) {
            console.error('Error creating coupon usage record:', couponUsageError)
          } else {
            console.log('Coupon usage record created successfully')
          }

          // Update coupon usage count
          const { data: currentCoupon } = await supabaseClient
            .from('coupons')
            .select('usage_count')
            .eq('id', couponId)
            .single()
          
          if (currentCoupon) {
            const { error: couponUpdateError } = await supabaseClient
              .from('coupons')
              .update({ usage_count: (currentCoupon.usage_count || 0) + 1 })
              .eq('id', couponId)
            
            if (couponUpdateError) {
              console.error('Error updating coupon usage count:', couponUpdateError)
            } else {
              console.log('Coupon usage count updated successfully')
            }
          }
        }
      }

      // Update payment status
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments_v2')
        .update({
          payment_status: 'completed',
          val_id: val_id,
          gateway_response: ipnData,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', tran_id)
        .select()
        .single()

      if (paymentError) {
        console.error('Payment update error:', paymentError)
        return new Response('Payment update failed', { 
          status: 500,
          headers: corsHeaders
        })
      }

      if (payment) {
        // Update enrollment status
        const { error: enrollmentError } = await supabaseClient
          .from('enrollments_v2')
          .update({ enrollment_status: 'completed' })
          .eq('id', payment.enrollment_id)

        if (enrollmentError) {
          console.error('Enrollment update error:', enrollmentError)
        }

        // Create enrollment in main table
        const { error: mainEnrollmentError } = await supabaseClient
          .from('enrollments')
          .insert({
            student_id: payment.user_id,
            course_id: payment.course_id,
            enrolled_at: new Date().toISOString()
          })

        if (mainEnrollmentError) {
          console.error('Main enrollment creation error:', mainEnrollmentError)
        }

        console.log('Payment processed successfully:', tran_id)
      }
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      console.log('Processing failed/cancelled payment:', tran_id, status)

      // Update payment status to failed
      const { error: failedUpdateError } = await supabaseClient
        .from('payments_v2')
        .update({
          payment_status: 'failed',
          gateway_response: ipnData,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', tran_id)

      if (failedUpdateError) {
        console.error('Failed payment update error:', failedUpdateError)
      }

      console.log('Payment failed:', tran_id, status)
    }

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('IPN processing error:', error)
    return new Response('Error processing IPN', { 
      status: 500,
      headers: corsHeaders
    })
  }
})
