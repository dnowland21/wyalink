// Supabase Edge Function for sending emails via Office 365
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  cc?: string
  bcc?: string
  subject: string
  content: string
  leadId?: string
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

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const emailRequest: EmailRequest = await req.json()
    const { to, cc, bcc, subject, content, leadId } = emailRequest

    // Validate required fields
    if (!to || !subject || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required fields: to, subject, content',
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

    // Prepare email
    const fromAddress = settings['email.from.address'] || settings['email.smtp.username']

    await client.send({
      from: `${settings['email.from.name']} <${fromAddress}>`,
      to: to,
      cc: cc,
      bcc: bcc,
      subject: subject,
      content: content,
      html: content.replace(/\n/g, '<br>'),
    })

    await client.close()

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error sending email:', error)

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Failed to send email',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
