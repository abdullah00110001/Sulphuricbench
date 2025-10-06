import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate secure JWT token
function generateToken(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  return encode(randomBytes).replace(/[+/=]/g, (match) => {
    switch (match) {
      case '+': return '-'
      case '/': return '_'
      case '=': return ''
      default: return match
    }
  })
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

    const { email, password } = await req.json()

    // Super admin credentials
    const validCredentials = [
      { email: 'abdullahusimin1@gmail.com', password: '@abdullah1', name: 'Abdullah Usimin' },
      { email: 'stv7168@gmail.com', password: '12345678', name: 'STV Admin' },
      { email: 'abdullahabeer003@gmail.com', password: '12345678', name: 'Abdullah Abeer' }
    ]

    const credential = validCredentials.find(
      cred => cred.email === email && cred.password === password
    )

    if (!credential) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid credentials' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get or create user profile
    let { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', credential.email)
      .single()

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          email: credential.email,
          full_name: credential.name,
          role: 'super_admin',
          email_verified: true,
          approval_status: 'approved'
        })
        .select()
        .single()

      if (profileError) {
        throw profileError
      }
      profile = newProfile
    }

    // Generate token and create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create session record
    const { error: sessionError } = await supabaseClient
      .from('super_admin_sessions')
      .insert({
        user_id: profile.id,
        token,
        expires_at: expiresAt.toISOString(),
        user_agent: req.headers.get('user-agent') || '',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      // Continue anyway - session tracking is not critical
    }

    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role
      },
      expiresAt: expiresAt.toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Super admin login error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Login failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})