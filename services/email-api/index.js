import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

/**
 * Get email settings from database
 */
async function getEmailSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('category', 'email')

    if (error) throw error

    const settings = {}
    data.forEach((setting) => {
      try {
        settings[setting.key] = JSON.parse(setting.value)
      } catch {
        settings[setting.key] = setting.value
      }
    })

    return settings
  } catch (error) {
    console.error('Error fetching email settings:', error)
    throw error
  }
}

/**
 * Create nodemailer transporter with Office 365 settings
 */
async function createTransporter() {
  const settings = await getEmailSettings()

  console.log('Email settings:', JSON.stringify(settings, null, 2))
  console.log('email.enabled value:', settings['email.enabled'])
  console.log('email.enabled type:', typeof settings['email.enabled'])

  if (!settings['email.enabled']) {
    throw new Error('Email sending is disabled in settings')
  }

  const config = {
    host: settings['email.smtp.host'] || 'smtp.office365.com',
    port: settings['email.smtp.port'] || 587,
    secure: settings['email.smtp.secure'] || false,
    auth: {
      user: settings['email.smtp.username'],
      pass: settings['email.smtp.password'],
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  }

  return nodemailer.createTransporter(config)
}

/**
 * POST /api/email/send
 * Send an email
 */
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, cc, bcc, subject, content, leadId } = req.body

    // Validate required fields
    if (!to || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, content',
      })
    }

    // Get email settings
    const settings = await getEmailSettings()

    // Create transporter
    const transporter = await createTransporter()

    // Prepare email options
    const mailOptions = {
      from: {
        name: settings['email.from.name'] || 'WyaLink',
        address: settings['email.from.address'] || settings['email.smtp.username'],
      },
      to,
      cc,
      bcc,
      subject,
      text: content,
      html: content.replace(/\n/g, '<br>'),
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent:', info.messageId)

    // Return success response
    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
    })
  }
})

/**
 * POST /api/email/test
 * Send a test email to verify configuration
 */
app.post('/api/email/test', async (req, res) => {
  try {
    const { to } = req.body

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: to',
      })
    }

    // Get email settings
    const settings = await getEmailSettings()

    // Create transporter
    const transporter = await createTransporter()

    // Prepare test email
    const mailOptions = {
      from: {
        name: settings['email.from.name'] || 'WyaLink',
        address: settings['email.from.address'] || settings['email.smtp.username'],
      },
      to,
      subject: 'Test Email from WyaLink LinkOS',
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you received this email, your Office 365 integration with WyaLink LinkOS is configured properly.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Sent from WyaLink LinkOS</p>
      `,
    }

    // Send test email
    const info = await transporter.sendMail(mailOptions)

    console.log('Test email sent:', info.messageId)

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Test email sent successfully',
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send test email',
    })
  }
})

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'email-api' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Email API service running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
