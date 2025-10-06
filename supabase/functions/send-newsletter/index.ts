
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
    const { subject, content, recipients, audience } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store newsletter in database
    const { data: newsletter, error: newsletterError } = await supabaseClient
      .from('newsletters')
      .insert({
        subject,
        content,
        audience,
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipient_count: recipients.length
      })
      .select()
      .single()

    if (newsletterError) throw newsletterError

    // In a real implementation, you would integrate with an email service here
    // For now, we'll just log and return success
    console.log(`Newsletter "${subject}" would be sent to ${recipients.length} ${audience}`)
    console.log('Recipients:', recipients)
    console.log('Content:', content)

    // You can integrate with services like:
    // - Resend
    // - SendGrid
    // - Postmark
    // - AWS SES
    // etc.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent to ${recipients.length} recipients`,
        newsletterId: newsletter.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
