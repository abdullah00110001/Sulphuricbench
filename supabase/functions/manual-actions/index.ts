import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Lightweight health check without requiring a body
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, function: 'manual-actions', time: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, paymentId, status } = await req.json()

    // Normalize and validate super admin email
    const emailLower = (email || '').toString().trim().toLowerCase()
    const validEmails = ['abdullahusimin1@gmail.com', 'stv7168@gmail.com', 'abdullahabeer003@gmail.com']
    if (!validEmails.includes(emailLower)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'health') {
      return new Response(JSON.stringify({ ok: true, function: 'manual-actions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'get_pending') {
      // Get pending manual payments
      const { data, error } = await supabaseClient
        .from('manual_payments')
        .select(`
          *,
          profiles!manual_payments_user_id_fkey(full_name, email),
          courses!manual_payments_course_id_fkey(title, price)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching manual payments:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch payments' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'update_status') {
      // Update payment status
      const { error } = await supabaseClient
        .from('manual_payments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (error) {
        console.error('Error updating payment status:', error)
        return new Response(JSON.stringify({ error: 'Failed to update payment' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // If approved, create enrollment and invoice
      if (status === 'approved') {
        const { data: payment } = await supabaseClient
          .from('manual_payments')
          .select('user_id, course_id, full_name, amount')
          .eq('id', paymentId)
          .single()

        if (payment) {
          // Create enrollment in enrollments_v2 table (new version)
          await supabaseClient
            .from('enrollments_v2')
            .insert({
              user_id: payment.user_id,
              course_id: payment.course_id,
              name: payment.full_name,
              email: '', // Will be filled from profile if available
              phone: '',
              enrollment_status: 'approved'
            })

          // Also create in old enrollments table for backward compatibility
          await supabaseClient
            .from('enrollments')
            .insert({
              student_id: payment.user_id,
              course_id: payment.course_id,
              enrolled_at: new Date().toISOString()
            })

          // Generate invoice number and access code
          const invoiceNumber = `SB${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
          const accessCode = `SB${new Date().getFullYear()}${payment.full_name.split(' ')[0].toUpperCase()}${String(Date.now()).slice(-4)}`

          // Create invoice
          const { error: invoiceError } = await supabaseClient
            .from('invoices')
            .insert({
              user_id: payment.user_id,
              course_id: payment.course_id,
              amount: payment.amount,
              status: 'paid',
              invoice_number: invoiceNumber,
              access_code: accessCode,
              issued_at: new Date().toISOString()
            })

          if (invoiceError) {
            console.error('Error creating invoice:', invoiceError)
          } else {
            console.log('Invoice created successfully:', invoiceNumber)
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Error in manual-actions:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})