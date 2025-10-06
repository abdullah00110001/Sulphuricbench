
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

    const { email, code } = await req.json()

    console.log('Verification request:', { email, code })

    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Email and code are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the code using our database function
    const { data: isValid, error: verifyError } = await supabaseClient
      .rpc('verify_email_code', {
        email_param: email,
        code_param: code
      })

    if (verifyError) {
      console.error('Verification error:', verifyError)
      return new Response(JSON.stringify({ error: verifyError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!isValid) {
      console.log('Invalid or expired code')
      return new Response(JSON.stringify({ error: 'Invalid or expired verification code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Code verified successfully')

    // Find the user by email and confirm their email
    const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers()
    
    if (userError) {
      console.error('User lookup error:', userError)
      return new Response(JSON.stringify({ error: 'Failed to find user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.log('User not found:', email)
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Found user:', user.id)

    // Update user to mark email as confirmed
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (updateError) {
      console.error('User update error:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to confirm email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Email confirmed successfully')

    return new Response(JSON.stringify({
      message: 'Email verified successfully. You can now log in.',
      verified: true,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
