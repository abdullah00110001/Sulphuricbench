
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getEmailTemplate = (template: string, data: any) => {
  const templates = {
    'email-verification': {
      subject: 'Verify Your Email - Sulphuric Bench',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">Sulphuric Bench</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
            <h2 style="color: #334155;">Verify Your Email Address</h2>
            <p>Hi ${data.name},</p>
            <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background: #2563eb; color: white; padding: 15px 30px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.verificationCode}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>Best regards,<br>The Sulphuric Bench Team</p>
          </div>
        </div>
      `
    },
    'newsletter-welcome': {
      subject: 'Welcome to Sulphuric Bench Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">Sulphuric Bench</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
            <h2 style="color: #334155;">Welcome to Our Newsletter!</h2>
            <p>Hi there!</p>
            <p>Thank you for subscribing to the Sulphuric Bench newsletter! You'll now receive:</p>
            <ul style="color: #64748b;">
              <li>Latest course updates and new releases</li>
              <li>Educational tips and resources</li>
              <li>Exclusive offers and discounts</li>
              <li>Community highlights and success stories</li>
            </ul>
            <p>We're excited to have you on board!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://sulphuricbench.com" style="background: #2563eb; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">Explore Courses</a>
            </div>
            <p>Best regards,<br>The Sulphuric Bench Team</p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
            <p>You're receiving this because you subscribed to our newsletter at sulphuricbench.com</p>
            <p>If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
          </div>
        </div>
      `
    },
    'super-admin-verification': {
      subject: 'Super Admin Login Verification - Sulphuric Bench',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">Sulphuric Bench</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
            <h2 style="color: #334155;">Super Admin Login Verification</h2>
            <p>Hi ${data.name},</p>
            <p>Please use the verification code below to complete your super admin login:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background: #dc2626; color: white; padding: 15px 30px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.verificationCode}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #dc2626; font-weight: bold;">⚠️ This is a security-sensitive operation. If you didn't attempt to log in, please contact the system administrator immediately.</p>
            <p>Best regards,<br>The Sulphuric Bench Security Team</p>
          </div>
        </div>
      `
    },
    'enrollment-confirmation': {
      subject: 'Course Enrollment Confirmed - Sulphuric Bench',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">Sulphuric Bench</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
            <h2 style="color: #334155;">🎉 Enrollment Confirmed!</h2>
            <p>Hi ${data.name},</p>
            <p>Congratulations! Your enrollment for <strong>${data.courseName}</strong> has been confirmed.</p>
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin: 0 0 10px 0; color: #334155;">Course Details:</h3>
              <p style="margin: 5px 0;"><strong>Course:</strong> ${data.courseName}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
              <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ৳${data.amount}</p>
            </div>
            <p>You will receive your course access details soon. Please check your email regularly for further instructions.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://sulphuricbench.com" style="background: #2563eb; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">Visit Dashboard</a>
            </div>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The Sulphuric Bench Team</p>
          </div>
        </div>
      `
    }
  }

  return templates[template as keyof typeof templates] || null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, template, data, html } = await req.json()

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Recipient email is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let emailContent = html
    let emailSubject = subject

    // Use template if provided
    if (template) {
      const templateContent = getEmailTemplate(template, data || {})
      if (templateContent) {
        emailContent = templateContent.html
        emailSubject = emailSubject || templateContent.subject
      }
    }

    // Simulate email sending with console logs for now
    console.log('=== EMAIL SIMULATION ===')
    console.log('To:', to)
    console.log('Subject:', emailSubject)
    console.log('Template:', template)
    console.log('Data:', JSON.stringify(data, null, 2))
    console.log('HTML Content Preview:', emailContent.substring(0, 200) + '...')
    console.log('========================')

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        to: to,
        subject: emailSubject,
        template: template
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
