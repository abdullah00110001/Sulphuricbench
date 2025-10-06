
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, data } = await req.json()
    const authHeader = req.headers.get('Authorization')

    console.log('Payment function called with action:', action)
    console.log('Request data:', data)
    console.log('Auth header present:', !!authHeader)

    // Create user client for authentication
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    let user = null
    
    // For enrollment creation, allow anonymous access
    if (action === 'create_enrollment') {
      if (authHeader) {
        try {
          const token = authHeader.replace('Bearer ', '')
          const { data: { user: authUser }, error: authError } = await userClient.auth.getUser(token)
          
          if (authError) {
            console.log('Auth error (continuing as anonymous):', authError.message)
            user = { id: 'anonymous', email: data.email || 'anonymous@example.com' }
          } else {
            user = authUser
            console.log('User authenticated:', user?.email)
          }
        } catch (error) {
          console.log('Authentication failed (continuing as anonymous):', error instanceof Error ? error.message : 'Unknown error')
          user = { id: 'anonymous', email: data.email || 'anonymous@example.com' }
        }
      } else {
        console.log('No authorization header - creating anonymous enrollment')
        user = { id: 'anonymous', email: data.email || 'anonymous@example.com' }
      }
    } else {
      // For other actions, require authentication
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authorization required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const token = authHeader.replace('Bearer ', '')
      const { data: { user: authUser }, error: authError } = await userClient.auth.getUser(token)
      
      if (authError) {
        console.error('Auth error:', authError)
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      user = authUser
    }

    let result;

    switch (action) {
      case 'create_enrollment':
        const { courseId, name, email, phone, institution, batch, couponId, discountAmount } = data
        
        console.log('Creating enrollment for course:', courseId)

        // Validate required fields
        if (!courseId || !name || !email || !phone) {
          throw new Error('Missing required fields: courseId, name, email, or phone')
        }

        // Get course details for payment
        const { data: course, error: courseError } = await supabaseClient
          .from('courses')
          .select('title, price')
          .eq('id', courseId)
          .single()

        if (courseError || !course) {
          console.error('Course fetch error:', courseError)
          throw new Error('Course not found')
        }

        console.log('Course found:', course.title, 'Price:', course.price)

        // Check if user already enrolled
        const { data: existingEnrollment } = await supabaseClient
          .from('enrollments')
          .select('id')
          .eq('student_id', user?.id || 'anonymous')
          .eq('course_id', courseId)
          .single()

        if (existingEnrollment) {
          throw new Error('You are already enrolled in this course')
        }

        // Calculate final amount after discount
        let finalAmount = course.price
        let couponData = null
        if (couponId && discountAmount) {
          finalAmount = course.price - discountAmount
          
          // Get coupon data for usage tracking
          const { data: coupon } = await supabaseClient
            .from('coupons')
            .select('*')
            .eq('id', couponId)
            .single()
          
          if (coupon) {
            couponData = coupon
          }
        }

        // Create enrollment record
        const { data: enrollmentData, error: enrollmentError } = await supabaseClient
          .from('enrollments_v2')
          .insert({
            user_id: user?.id === 'anonymous' ? null : user?.id,
            course_id: courseId,
            name,
            email,
            phone,
            institution: institution || null,
            batch: batch || null,
            enrollment_status: 'pending'
          })
          .select()
          .single()

        if (enrollmentError) {
          console.error('Enrollment creation error:', enrollmentError)
          throw new Error(`Failed to create enrollment: ${enrollmentError.message}`)
        }

        console.log('Enrollment created:', enrollmentData.id)

        // Generate unique transaction ID
        const transactionId = `SB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Create SSLCommerz session with correct credentials and API endpoint
// Determine callback base URL dynamically
const originHeader = req.headers.get('origin') || ''
const siteUrl = Deno.env.get('SITE_URL') || ''
const clientBaseUrl = (data && data.base_url) ? String(data.base_url) : ''
const baseUrl = clientBaseUrl || originHeader || siteUrl || 'https://sulphuricfire.netlify.app'

const sslcommerzData = {
  store_id: 'sulph6862620398556',
  store_passwd: 'sulph6862620398556@ssl',
  total_amount: finalAmount,
  currency: 'BDT',
  tran_id: transactionId,
  success_url: `${baseUrl}/payment/success`,
  fail_url: `${baseUrl}/payment/failed`,
  cancel_url: `${baseUrl}/payment/cancelled`,
  ipn_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/sslcommerz-ipn`,
  shipping_method: 'No',
  product_name: course.title,
  product_category: 'Education',
  product_profile: 'general',
  cus_name: name,
  cus_email: email,
  cus_add1: 'N/A',
  cus_add2: 'N/A',
  cus_city: 'N/A',
  cus_state: 'N/A',
  cus_postcode: 'N/A',
  cus_country: 'Bangladesh',
  cus_phone: phone,
  cus_fax: 'N/A',
  ship_name: name,
  ship_add1: 'N/A',
  ship_add2: 'N/A',
  ship_city: 'N/A',
  ship_state: 'N/A',
  ship_postcode: 'N/A',
  ship_country: 'Bangladesh',
  multi_card_name: 'mastercard,visacard,amexcard',
  value_a: enrollmentData.id, // enrollment_id
  value_b: courseId,
  value_c: user?.id || 'anonymous',
  value_d: couponId || '', // store coupon_id for later use
}

        console.log('Initializing SSLCommerz with transaction ID:', transactionId)

        // Initialize SSLCommerz payment session using the correct v3 API endpoint
        const sslResponse = await fetch('https://sandbox.sslcommerz.com/gwprocess/v3/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(sslcommerzData).toString(),
        })

        if (!sslResponse.ok) {
          console.error('SSLCommerz API request failed:', sslResponse.status, sslResponse.statusText)
          throw new Error(`SSLCommerz API request failed: ${sslResponse.status}`)
        }

        const sslData = await sslResponse.json()
        console.log('SSLCommerz response:', sslData)

        if (sslData.status !== 'SUCCESS') {
          console.error('SSLCommerz error:', sslData)
          throw new Error(`Payment gateway error: ${sslData.failedreason || 'Unknown error'}`)
        }

        // Create payment record
        const { data: payment, error: paymentError } = await supabaseClient
          .from('payments_v2')
          .insert({
            enrollment_id: enrollmentData.id,
            user_id: user?.id === 'anonymous' ? null : user?.id,
            course_id: courseId,
            amount: finalAmount,
            currency: 'BDT',
            payment_method: 'sslcommerz',
            payment_status: 'pending',
            transaction_id: transactionId,
            gateway_response: sslData
          })
          .select()
          .single()

        if (paymentError) {
          console.error('Payment record creation error:', paymentError)
          throw new Error(`Failed to create payment record: ${paymentError.message}`)
        }

        console.log('Payment record created:', payment.id)
        console.log('Gateway URL:', sslData.GatewayPageURL)

        result = {
          data: {
            enrollment: enrollmentData,
            payment: payment,
            gateway_url: sslData.GatewayPageURL,
            session_key: sslData.sessionkey
          }
        }
        break

      case 'validate_payment':
        const { val_id } = data
        
        console.log('Validating payment with val_id:', val_id)

        if (!val_id) {
          throw new Error('val_id is required for payment validation')
        }

        // Validate payment with SSLCommerz using correct credentials
        const validationResponse = await fetch(
          `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=sulph6862620398556&store_passwd=sulph6862620398556@ssl&format=json`
        )
        
        if (!validationResponse.ok) {
          console.error('Validation API request failed:', validationResponse.status)
          throw new Error(`Validation API request failed: ${validationResponse.status}`)
        }

        const validationData = await validationResponse.json()
        console.log('Validation response:', validationData)
        
        if (validationData.status === 'VALID') {
          // Update payment status
          const { data: updatedPayment, error: updateError } = await supabaseClient
            .from('payments_v2')
            .update({
              payment_status: 'completed',
              val_id: val_id,
              gateway_response: validationData,
              updated_at: new Date().toISOString()
            })
            .eq('transaction_id', validationData.tran_id)
            .select()
            .single()

          if (updateError) {
            console.error('Payment update error:', updateError)
            throw new Error('Failed to update payment status')
          }

          if (updatedPayment) {
            // Update enrollment status
            await supabaseClient
              .from('enrollments_v2')
              .update({ enrollment_status: 'completed' })
              .eq('id', updatedPayment.enrollment_id)

            // Create enrollment in main table
            await supabaseClient
              .from('enrollments')
              .insert({
                student_id: updatedPayment.user_id,
                course_id: updatedPayment.course_id,
                enrolled_at: new Date().toISOString()
              })

            // If coupon was used, mark it as used
            const couponId = validationData.value_d
            if (couponId && couponId.trim() !== '') {
              console.log('Processing coupon usage for coupon:', couponId)
              
              try {
                // Create coupon usage record
                await supabaseClient
                  .from('coupon_usage')
                  .insert({
                    coupon_id: couponId,
                    user_id: updatedPayment.user_id,
                    course_id: updatedPayment.course_id,
                    discount_applied: updatedPayment.amount
                  })

                // Increment coupon usage count using RPC
                await supabaseClient
                  .rpc('increment_coupon_usage', { coupon_id: couponId })

                console.log('Coupon usage recorded successfully')
              } catch (couponError) {
                console.error('Error recording coupon usage:', couponError)
                // Don't fail the payment if coupon tracking fails
              }
            }

            // Generate invoice
            const { data: enrollment } = await supabaseClient
              .from('enrollments_v2')
              .select('*')
              .eq('id', updatedPayment.enrollment_id)
              .single()

            const invoiceNumber = await generateInvoiceNumber()
            const accessCode = await generateAccessCode(enrollment.batch || '', enrollment.name)

            const { data: invoice } = await supabaseClient
              .from('invoices')
              .insert({
                invoice_number: invoiceNumber,
                payment_id: updatedPayment.id,
                enrollment_id: updatedPayment.enrollment_id,
                user_id: updatedPayment.user_id,
                course_id: updatedPayment.course_id,
                status: 'valid',
                access_code: accessCode,
                amount: updatedPayment.amount,
                issued_at: new Date().toISOString()
              })
              .select()
              .single()

            // Get course details for email
            const { data: courseData } = await supabaseClient
              .from('courses')
              .select('title')
              .eq('id', updatedPayment.course_id)
              .single()

            // Send enrollment confirmation email
            try {
              await supabaseClient.functions.invoke('send-email', {
                body: {
                  to: enrollment.email,
                  template: 'enrollment-confirmation',
                  data: {
                    name: enrollment.name,
                    courseName: courseData?.title || 'Course',
                    paymentMethod: 'SSLCommerz',
                    amount: updatedPayment.amount
                  }
                }
              })
            } catch (emailError) {
              console.warn('Failed to send enrollment email:', emailError)
              // Don't fail the payment if email fails
            }

            result = { data: { payment: updatedPayment, invoice: invoice } }
          }
        } else {
          result = { error: 'Payment validation failed' }
        }
        break

      case 'get_invoice':
        const { invoiceId } = data
        
        result = await supabaseClient
          .from('invoices')
          .select(`
            *,
            payments_v2(*),
            enrollments_v2(*),
            courses(title, thumbnail_url)
          `)
          .eq('id', invoiceId)
          .eq('user_id', user.id)
          .single()
        break

      default:
        console.error('Invalid action:', action)
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    if (result.error) {
      console.error('Result error:', result.error)
      return new Response(JSON.stringify({ error: result.error.message || result.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Operation completed successfully')
    return new Response(JSON.stringify({
      message: 'Operation completed successfully',
      data: result.data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function generateInvoiceNumber(): Promise<string> {
  return 'SB' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6)
}

async function generateAccessCode(batch: string, userName: string): Promise<string> {
  const cleanName = userName.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase()
  const now = new Date()
  return `SB${batch}D${now.getDate()}M${now.getMonth() + 1}Y${now.getFullYear()}N${cleanName}`
}
