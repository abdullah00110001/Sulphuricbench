
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
    // Use service role client to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { bucket, fileName, fileData, contentType } = await req.json()

    console.log('Uploading file:', fileName, 'to bucket:', bucket)

    // Convert base64 to Uint8Array
    const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0))

    // Upload file using service role
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType
      })

    if (error) {
      console.error('Storage upload error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(fileName)

    console.log('File uploaded successfully:', publicUrl)

    return new Response(JSON.stringify({
      success: true,
      publicUrl: publicUrl,
      path: data.path
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Upload function error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
