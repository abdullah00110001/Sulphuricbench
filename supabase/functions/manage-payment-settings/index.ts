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
    return new Response(JSON.stringify({ ok: true, function: 'manage-payment-settings', time: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, settings } = await req.json()

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
      return new Response(JSON.stringify({ ok: true, function: 'manage-payment-settings' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'get') {
      // Get payment settings
      const { data, error } = await supabaseClient
        .from('payment_settings')
        .select('*')
        .maybeSingle()

      if (error) {
        console.error('Error fetching payment settings:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'update') {
      // Update payment settings
      const { error } = await supabaseClient
        .from('payment_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          sslcommerz_enabled: settings.sslcommerz_enabled,
          bkash_enabled: settings.bkash_enabled,
          sslcommerz_store_id: settings.sslcommerz_store_id,
          sslcommerz_store_password: settings.sslcommerz_store_password,
          bkash_instructions: settings.bkash_instructions,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating payment settings:', error)
        return new Response(JSON.stringify({ error: 'Failed to update settings' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in manage-payment-settings:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})