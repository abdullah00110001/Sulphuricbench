
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Auth signup function called')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { email, password, fullName, role = 'student', resendCode = false } = await req.json()

    // If this is a resend request, just generate and send new code
    if (resendCode) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Delete existing codes
      await supabaseClient
        .from('verification_codes')
        .delete()
        .eq('email', email)
        .eq('code_type', 'email_verification')
        .eq('used_at', null)
      
      // Store new verification code
      const { error: codeError } = await supabaseClient
        .from('verification_codes')
        .insert({
          email: email,
          code: verificationCode,
          code_type: 'email_verification'
        })

      if (codeError) {
        console.error('Verification code error:', codeError)
      }

      // Send verification email
      try {
        const emailResponse = await supabaseClient.functions.invoke('send-email', {
          body: {
            to: email,
            subject: 'New Verification Code - Sulphuric Bench',
            template: 'email-verification',
            data: {
              name: 'User',
              verificationCode: verificationCode
            }
          }
        })

        if (emailResponse.error) {
          console.error('Email sending failed:', emailResponse.error)
        } else {
          console.log('Verification email sent successfully')
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
      }

      return new Response(
        JSON.stringify({
          message: 'New verification code sent to your email.',
          success: true
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Input validation for new signup
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }), 
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

    // Password validation
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating user with email:', email)

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName || 'User',
        role: role
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User created successfully:', authData.user.id)

    // Create profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName || 'User',
        role: role,
        approval_status: role === 'teacher' ? 'pending' : 'approved'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Continue anyway, as the trigger should handle this
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store verification code
    const { error: codeError } = await supabaseClient
      .from('verification_codes')
      .insert({
        email: email,
        code: verificationCode,
        code_type: 'email_verification'
      })

    if (codeError) {
      console.error('Verification code error:', codeError)
    }

    // Send verification email
    try {
      const emailResponse = await supabaseClient.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Verify Your Email - Sulphuric Bench',
          template: 'email-verification',
          data: {
            name: fullName || 'User',
            verificationCode: verificationCode
          }
        }
      })

      if (emailResponse.error) {
        console.error('Email sending failed:', emailResponse.error)
      } else {
        console.log('Verification email sent successfully')
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError)
    }

    return new Response(
      JSON.stringify({
        message: 'User created successfully. Please check your email for verification code.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          requires_verification: true
        }
      }), 
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
