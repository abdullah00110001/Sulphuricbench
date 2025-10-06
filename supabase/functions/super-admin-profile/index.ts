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
        success: false, 
        error: 'No token provided' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token and get user
    const { data: session, error: sessionError } = await supabaseClient
      .from('super_admin_sessions')
      .select('user_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid or expired token' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'GET') {
      // Get profile
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name, role, avatar_url, bio')
        .eq('id', session.user_id)
        .single()

      if (error) {
        throw error
      }

      return new Response(JSON.stringify({
        success: true,
        user: profile
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'PUT') {
      // Update profile
      const { full_name, avatar_url, bio } = await req.json()

      const { data: updatedProfile, error } = await supabaseClient
        .from('profiles')
        .update({
          full_name,
          avatar_url,
          bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user_id)
        .select('id, email, full_name, role, avatar_url, bio')
        .single()

      if (error) {
        throw error
      }

      return new Response(JSON.stringify({
        success: true,
        user: updatedProfile
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed' 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Profile operation error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Operation failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})