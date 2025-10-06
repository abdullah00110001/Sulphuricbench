
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== MANAGE COUPONS FUNCTION START ===')
  console.log('Request method:', req.method)

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const { action, superAdminEmail, couponId, data } = requestBody

    console.log('Manage coupons request:', { 
      action, 
      superAdminEmail,
      couponId: couponId || 'not provided',
      hasData: !!data
    })

    // Validate super admin authentication
    const validSuperAdminEmails = ['abdullahusimin1@gmail.com', 'stv7168@gmail.com', 'abdullahabeer003@gmail.com']
    
    if (!superAdminEmail || !validSuperAdminEmails.includes(superAdminEmail)) {
      console.log('Invalid super admin email:', superAdminEmail)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized: Invalid super admin email' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let result;

    switch (action) {
      case 'create':
        console.log('Creating coupon with data:', data)
        
        if (!data?.code || !data.code.trim()) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Coupon code is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const couponData = {
          code: data.code.trim().toUpperCase(),
          discount_type: data.discount_type || 'percentage',
          discount_percentage: parseInt(data.discount_percentage) || 0,
          discount_amount: parseFloat(data.discount_amount) || 0,
          valid_from: new Date(data.valid_from).toISOString(),
          valid_until: new Date(data.valid_until).toISOString(),
          usage_limit: parseInt(data.usage_limit) || 1,
          usage_count: 0,
          is_active: Boolean(data.is_active),
          minimum_amount: parseFloat(data.minimum_amount) || 0,
          description: data.description?.trim() || '',
          applicable_courses: data.applicable_courses || [],
          created_by: null // Will be set by the system
        }

        const { data: createData, error: createError } = await supabaseClient
          .from('coupons')
          .insert(couponData)
          .select()

        if (createError) {
          console.error('Coupon creation error:', createError)
          return new Response(JSON.stringify({ 
            success: false,
            error: `Failed to create coupon: ${createError.message}`
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        result = { data: createData, error: null }
        break

      case 'get_all':
        const { data: allCoupons, error: fetchError } = await supabaseClient
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false })

        result = { data: allCoupons, error: fetchError }
        break

      case 'delete':
        if (!couponId) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Coupon ID is required for delete' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error: deleteError } = await supabaseClient
          .from('coupons')
          .delete()
          .eq('id', couponId)

        if (deleteError) {
          console.error('Coupon deletion error:', deleteError)
          return new Response(JSON.stringify({ 
            success: false,
            error: `Failed to delete coupon: ${deleteError.message}`
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        result = { data: { success: true }, error: null }
        break

      default:
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid action: ' + action
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    if (result.error) {
      console.error('Database operation error:', result.error)
      return new Response(JSON.stringify({ 
        success: false,
        error: result.error.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Operation completed successfully')
    return new Response(JSON.stringify({
      success: true,
      message: `${action} completed successfully`,
      data: result.data
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
