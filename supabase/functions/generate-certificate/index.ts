
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

    const { courseId, userId } = await req.json()

    // Verify course completion
    const { data: enrollment } = await supabaseClient
      .from('enrollments')
      .select('*, courses(*)')
      .eq('course_id', courseId)
      .eq('student_id', userId)
      .single()

    if (!enrollment) {
      return new Response(JSON.stringify({ error: 'Enrollment not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if course is completed (all modules 100% complete)
    const { data: progress } = await supabaseClient
      .from('course_progress')
      .select('progress_percentage')
      .eq('course_id', courseId)
      .eq('user_id', userId)

    const isCompleted = progress && progress.length > 0 && 
      progress.every(p => p.progress_percentage === 100)

    if (!isCompleted) {
      return new Response(JSON.stringify({ error: 'Course not completed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Generate certificate HTML
    const certificateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(45deg, #f0f2f5, #e6f3ff);
          }
          .certificate {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            border: 20px solid #2c5aa0;
            border-radius: 20px;
            box-shadow: 0 0 30px rgba(0,0,0,0.2);
            position: relative;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 3px solid #gold;
            border-radius: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .title {
            font-size: 48px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          .subtitle {
            font-size: 20px;
            color: #666;
            margin-bottom: 30px;
          }
          .recipient {
            text-align: center;
            margin: 40px 0;
          }
          .recipient-name {
            font-size: 36px;
            font-weight: bold;
            color: #2c5aa0;
            text-decoration: underline;
            margin: 20px 0;
          }
          .course-name {
            font-size: 24px;
            color: #333;
            font-style: italic;
            margin: 20px 0;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            align-items: center;
          }
          .date {
            font-size: 16px;
            color: #666;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #333;
            width: 200px;
            margin: 10px 0;
          }
          .logo {
            position: absolute;
            top: 30px;
            right: 30px;
            width: 80px;
            height: 80px;
            background: #2c5aa0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="logo">SB</div>
          
          <div class="header">
            <div class="title">Certificate of Completion</div>
            <div class="subtitle">This is to certify that</div>
          </div>
          
          <div class="recipient">
            <div class="recipient-name">${profile?.full_name}</div>
            <p>has successfully completed the course</p>
            <div class="course-name">"${enrollment.courses.title}"</div>
            <p>and has demonstrated proficiency in the subject matter.</p>
          </div>
          
          <div class="footer">
            <div class="date">
              Date: ${new Date().toLocaleDateString()}
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div>Sulphuric Bench</div>
              <div>Education Platform</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Convert HTML to PDF using a service (you would need to integrate with a PDF service)
    // For now, we'll store the certificate record and return the HTML
    
    // Check if certificate already exists
    const { data: existingCert } = await supabaseClient
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (!existingCert) {
      // Create certificate record
      const { data: certificate, error: certError } = await supabaseClient
        .from('certificates')
        .insert({
          user_id: userId,
          course_id: courseId,
          certificate_url: `/certificates/${userId}/${courseId}.pdf`
        })
        .select()
        .single()

      if (certError) {
        return new Response(JSON.stringify({ error: certError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({
      message: 'Certificate generated successfully',
      certificateHtml,
      downloadUrl: `/certificates/${userId}/${courseId}.pdf`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
