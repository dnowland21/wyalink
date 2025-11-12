// Supabase Edge Function for testing email configuration
// Deploy with: supabase functions deploy test-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestEmailRequest {
  to: string
}

interface EmailSettings {
  'email.enabled': boolean
  'email.smtp.host': string
  'email.smtp.port': number
  'email.smtp.secure': boolean
  'email.smtp.username': string
  'email.smtp.password': string
  'email.from.name': string
  'email.from.address': string
}

async function getEmailSettings(supabase: any): Promise<EmailSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('category', 'email')

  if (error) throw error

  const settings: any = {}
  data.forEach((setting: any) => {
    try {
      settings[setting.key] = JSON.parse(setting.value)
    } catch {
      settings[setting.key] = setting.value
    }
  })

  return settings as EmailSettings
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user is authenticated and is admin
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Admin access required')
    }

    // Parse request body
    const { to }: TestEmailRequest = await req.json()

    if (!to) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required field: to',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get email settings from database
    const settings = await getEmailSettings(supabaseClient)

    // Check if email sending is enabled
    if (!settings['email.enabled']) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email sending is disabled in settings',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: settings['email.smtp.host'],
        port: settings['email.smtp.port'],
        tls: !settings['email.smtp.secure'], // Use STARTTLS if not secure
        auth: {
          username: settings['email.smtp.username'],
          password: settings['email.smtp.password'],
        },
      },
    })

    // Prepare test email
    const fromAddress = settings['email.from.address'] || settings['email.smtp.username']

    await client.send({
      from: `${settings['email.from.name']} <${fromAddress}>`,
      to: to,
      subject: 'Test Email from WyaLink LinkOS',
      content: 'This is a test email to verify your email configuration is working correctly.',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you received this email, your Office 365 integration with WyaLink LinkOS is configured properly.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Sent from WyaLink LinkOS</p>
      `,
    })

    await client.close()

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test email sent successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error sending test email:', error)

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Failed to send test email',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
