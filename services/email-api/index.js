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

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
    requireTLS: true, // Office 365 requires TLS
    tls: {
      ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
      minVersion: 'TLSv1.2', // Use modern TLS
    },
  }

  return nodemailer.createTransport(config)
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
 * POST /api/email/send-quote
 * Send a quote email with PDF attachment
 */
app.post('/api/email/send-quote', async (req, res) => {
  try {
    const { to, subject, message, quoteNumber, includePDF, pdfBase64, pdfFileName } = req.body

    // Validate required fields
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message',
      })
    }

    // Get email settings
    const settings = await getEmailSettings()

    // Create transporter
    const transporter = await createTransporter()

    // Build HTML email with WyaLink branding
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00254a 0%, #36b1b3 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">WyaLink</h1>
          <p style="color: white; margin: 10px 0 0 0;">Your Wireless Provider</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <div style="white-space: pre-wrap; line-height: 1.6; color: #374151;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p style="margin: 0 0 10px 0;">WyaLink • Your Wireless Provider</p>
          <p style="margin: 0;">Email: support@wyalink.com • Website: www.wyalink.com</p>
        </div>
      </div>
    `

    // Prepare email options
    const mailOptions = {
      from: {
        name: settings['email.from.name'] || 'WyaLink',
        address: settings['email.from.address'] || settings['email.smtp.username'],
      },
      to,
      subject,
      text: message,
      html: htmlContent,
    }

    // Add PDF attachment if included
    if (includePDF && pdfBase64) {
      mailOptions.attachments = [
        {
          filename: pdfFileName || `Quote-${quoteNumber}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ]
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log('Quote email sent:', info.messageId)

    // Return success response
    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Quote email sent successfully',
    })
  } catch (error) {
    console.error('Error sending quote email:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send quote email',
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
