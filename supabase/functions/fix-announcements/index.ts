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

    // Handle super admin token authentication
    const token = authHeader.replace('Bearer ', '')
    let user = null
    let userProfile = null
    
    if (token.startsWith('super-admin-token-')) {
      console.log('Processing super admin request')
      
      const superAdminEmail = 'abdullahusimin1@gmail.com'
      const superAdminId = `super-admin-${superAdminEmail.replace('@', '-').replace('.', '-')}`
      
      user = { id: superAdminId, email: superAdminEmail }
      userProfile = { role: 'super_admin' }
      
    } else {
      // Handle regular user authentication
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token)
      
      if (authError || !authUser) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      user = authUser
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      userProfile = profile
    }

    // Verify user is super admin
    if (userProfile?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let result;

    switch (action) {
      case 'create_announcement':
        result = await supabaseClient
          .from('announcements')
          .insert({
            title: data.title,
            content: data.content,
            priority: data.priority || 0,
            is_active: data.is_active !== false,
            author_id: user.id
          })
          .select()
          .single()
        break

      case 'get_announcements':
        result = await supabaseClient
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
        break

      case 'update_announcement':
        result = await supabaseClient
          .from('announcements')
          .update({
            title: data.title,
            content: data.content,
            priority: data.priority,
            is_active: data.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .select()
          .single()
        break

      case 'delete_announcement':
        result = await supabaseClient
          .from('announcements')
          .delete()
          .eq('id', data.id)
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
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})