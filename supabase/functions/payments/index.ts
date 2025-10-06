
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

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let result: any;

    switch (action) {
      case 'create_payment':
        const { courseId, amount, paymentMethod, phoneNumber } = data
        
        // Generate mock transaction ID
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Create payment record
        result = await supabaseClient
          .from('payments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            amount,
            payment_method: paymentMethod,
            phone_number: phoneNumber,
            transaction_id: transactionId,
            payment_status: 'pending'
          })
          .select()
          .single()

        // Simulate payment processing delay
        setTimeout(async () => {
          // Randomly succeed or fail (90% success rate for demo)
          const isSuccess = Math.random() > 0.1
          
          const updateData = {
            payment_status: isSuccess ? 'completed' : 'failed',
            updated_at: new Date().toISOString()
          }

          await supabaseClient
            .from('payments')
            .update(updateData)
            .eq('id', result.data.id)

          // If successful, create enrollment
          if (isSuccess) {
            await supabaseClient
              .from('enrollments')
              .insert({
                student_id: user.id,
                course_id: courseId,
                enrolled_at: new Date().toISOString()
              })

            // Send enrollment confirmation email
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('email, full_name')
              .eq('id', user.id)
              .single()

            const { data: course } = await supabaseClient
              .from('courses')
              .select('title')
              .eq('id', courseId)
              .single()

            if (profile && course) {
              await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
                },
                body: JSON.stringify({
                  to: profile.email,
                  subject: 'Course Enrollment Confirmed - Sulphuric Bench',
                  template: 'notification',
                  data: {
                    name: profile.full_name,
                    title: 'Enrollment Successful!',
                    message: `You have successfully enrolled in "${course.title}". You can now access the course content from your dashboard.`
                  }
                })
              })
            }
          }
        }, 3000) // 3 second delay

        break

      case 'check_payment_status':
        const { paymentId } = data
        
        result = await supabaseClient
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .eq('user_id', user.id)
          .single()
        break

      case 'get_payment_history':
        result = await supabaseClient
          .from('payments')
          .select(`
            *,
            courses(title, thumbnail_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        break

      case 'get_admin_payments':
        // Admin only
        const { data: adminProfile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (adminProfile?.role !== 'super_admin') {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        result = await supabaseClient
          .from('payments')
          .select(`
            *,
            profiles(full_name, email),
            courses(title)
          `)
          .order('created_at', { ascending: false })
        break

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      message: 'Operation completed successfully',
      data: result.data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
