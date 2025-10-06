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

    // Extract token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'No token provided' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token in database
    const { data: session, error } = await supabaseClient
      .from('super_admin_sessions')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name,
          role,
          avatar_url
        )
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !session) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Invalid or expired token' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update last used timestamp
    await supabaseClient
      .from('super_admin_sessions')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', token)

    return new Response(JSON.stringify({
      valid: true,
      user: session.profiles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'Verification failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})