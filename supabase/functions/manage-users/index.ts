
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

    const { action, userId, data } = await req.json()
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
      
      const validSuperAdminEmails = [
        'abdullahusimin1@gmail.com',
        'stv7168@gmail.com', 
        'abdullahabeer003@gmail.com'
      ]
      
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
      case 'approve_teacher':
        result = await supabaseClient
          .from('profiles')
          .update({ approval_status: 'approved' })
          .eq('id', userId)
          .eq('role', 'teacher')

        // Send approval notification email
        if (!result.error) {
          const { data: teacherProfile } = await supabaseClient
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single()

          if (teacherProfile) {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
              },
              body: JSON.stringify({
                to: teacherProfile.email,
                subject: 'Teacher Application Approved - Sulphuric Bench',
                template: 'notification',
                data: {
                  name: teacherProfile.full_name,
                  title: 'Application Approved!',
                  message: 'Congratulations! Your teacher application has been approved. You can now access your teacher dashboard and start creating courses.'
                }
              })
            })
          }
        }
        break

      case 'reject_teacher':
        result = await supabaseClient
          .from('profiles')
          .update({ approval_status: 'rejected' })
          .eq('id', userId)
          .eq('role', 'teacher')
        break

      case 'delete_user':
        // Delete user from auth
        result = await supabaseClient.auth.admin.deleteUser(userId)
        break

      case 'get_users':
        const { role, status } = data || {}
        
        // Get all auth users first
        const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
        
        if (authError) {
          console.error('Error fetching auth users:', authError)
          return new Response(JSON.stringify({ error: authError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Get all profiles
        const { data: profiles, error: profilesError } = await supabaseClient
          .from('profiles')
          .select('*')

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
        }

        // Merge auth users with profiles
        const mergedUsers = authUsers.users.map(authUser => {
          const profile = profiles?.find(p => p.id === authUser.id)
          
          return {
            id: authUser.id,
            email: authUser.email,
            full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown User',
            avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
            role: profile?.role || 'student',
            approval_status: profile?.approval_status || 'approved',
            phone: profile?.phone,
            bio: profile?.bio,
            location: profile?.location,
            website_url: profile?.website_url,
            points: profile?.points || 0,
            level: profile?.level || 1,
            social_links: profile?.social_links || {},
            created_at: authUser.created_at,
            updated_at: profile?.updated_at || authUser.updated_at,
            email_verified: authUser.email_confirmed_at ? true : false,
            last_sign_in_at: authUser.last_sign_in_at
          }
        })

        // Apply filters
        let filteredUsers = mergedUsers
        
        if (role && role !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.role === role)
        }
        
        if (status && status !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.approval_status === status)
        }

        // Sort by created_at desc
        filteredUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        result = {
          data: filteredUsers,
          error: null
        }
        break

      case 'get_analytics':
        // Get user statistics from both auth and profiles
        const { data: allAuthUsers } = await supabaseClient.auth.admin.listUsers()
        const { data: allProfiles } = await supabaseClient.from('profiles').select('role, approval_status')

        const students = allProfiles?.filter(p => p.role === 'student').length || 0
        const teachers = allProfiles?.filter(p => p.role === 'teacher' && p.approval_status === 'approved').length || 0
        const pendingTeachers = allProfiles?.filter(p => p.role === 'teacher' && p.approval_status === 'pending').length || 0

        result = {
          data: {
            totalUsers: allAuthUsers?.users?.length || 0,
            students: students,
            teachers: teachers,
            pendingTeachers: pendingTeachers
          },
          error: null
        }
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
