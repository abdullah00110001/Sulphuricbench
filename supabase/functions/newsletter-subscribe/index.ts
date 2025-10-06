
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

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Store subscription in the subscriptions table
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .upsert({ 
        email: email,
        is_active: true,
        subscribed_at: new Date().toISOString()
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('Newsletter subscription error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to subscribe to newsletter' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send welcome email using the send-email function
    try {
      const emailResponse = await supabaseClient.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Welcome to Sulphuric Bench Newsletter! 🎉',
          template: 'newsletter-welcome',
          data: {
            email: email
          }
        }
      })

      console.log('Newsletter welcome email response:', emailResponse)

      if (emailResponse.error) {
        console.error('Welcome email failed:', emailResponse.error)
        // Don't fail the subscription if email fails
      } else {
        console.log('Welcome email sent successfully to:', email)
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the subscription if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully subscribed to newsletter! Check your email for confirmation.',
        data: data
      }), 
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
