# Quote Email Service Setup Guide

This guide explains how to set up the email service for sending quotes to customers.

## Overview

The quote email functionality allows you to:
- Send branded emails to customers with quote details
- Attach professionally formatted PDF quotes
- Track when quotes are sent
- Automatically update quote status

## Required Components

### 1. Email Service Provider

You'll need to set up an email service provider. Recommended options:

#### Option A: Resend (Recommended)
- **Why**: Simple, modern API, great for transactional emails
- **Setup**: https://resend.com
- **Pricing**: Free tier includes 100 emails/day
- **API Documentation**: https://resend.com/docs/api-reference/emails/send-email

#### Option B: SendGrid
- **Why**: Robust, widely used
- **Setup**: https://sendgrid.com
- **Pricing**: Free tier includes 100 emails/day
- **API Documentation**: https://docs.sendgrid.com/api-reference/mail-send/mail-send

#### Option C: AWS SES
- **Why**: Cost-effective at scale
- **Setup**: https://aws.amazon.com/ses/
- **Pricing**: $0.10 per 1,000 emails

### 2. Backend API Endpoint

You need to create an API endpoint at `/api/send-quote-email` that:

1. Receives the email data
2. Sends the email via your chosen provider
3. Returns success/error response

## Implementation Steps

### Step 1: Choose and Setup Email Provider

1. Sign up for one of the email providers above
2. Verify your domain (required for production)
3. Get your API key

### Step 2: Create Supabase Edge Function

Create a Supabase Edge Function to handle email sending:

```bash
# Create the function
supabase functions new send-quote-email
```

Edit `supabase/functions/send-quote-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
  try {
    const { to, subject, message, quoteNumber, includePDF, pdfBase64, pdfFileName } = await req.json()

    const emailData: any = {
      from: 'WyaLink <quotes@wyalink.com>',
      to: [to],
      subject,
      html: `
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
      `,
    }

    // Add PDF attachment if included
    if (includePDF && pdfBase64) {
      emailData.attachments = [
        {
          filename: pdfFileName,
          content: pdfBase64,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ]
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Email send failed: ${error}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
```

### Step 3: Set Environment Variables

Add your email API key to Supabase:

```bash
# Set the environment variable
supabase secrets set RESEND_API_KEY=your_api_key_here
```

### Step 4: Deploy the Function

```bash
# Deploy to Supabase
supabase functions deploy send-quote-email
```

### Step 5: Update Frontend API Endpoint

Update the `SendQuoteModal.tsx` to use the correct Supabase Function URL:

```typescript
// Replace this line:
const response = await fetch('/api/send-quote-email', {

// With this:
const response = await fetch(
  `${process.env.VITE_SUPABASE_URL}/functions/v1/send-quote-email`,
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
```

## Email Template Customization

The email template in the Edge Function includes:

1. **Header**: WyaLink logo and branding with gradient background
2. **Body**: The custom message from the modal
3. **Footer**: Company information

You can customize the HTML template in the Edge Function to match your exact branding needs.

## Testing

### Test Locally

```bash
# Start Supabase locally
supabase start

# Serve the function locally
supabase functions serve send-quote-email --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-quote-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Quote",
    "message": "This is a test",
    "quoteNumber": "Q-001",
    "includePDF": false
  }'
```

### Test in Production

1. Create a draft quote in the application
2. Click "Send to Customer"
3. Fill in the email modal
4. Send the email
5. Check your email for the quote

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Ensure your API key is correct and set in Supabase secrets
2. **Check Domain Verification**: Verify your sending domain in your email provider
3. **Check Logs**: View Supabase function logs: `supabase functions logs send-quote-email`
4. **Check Spam**: Email might be in spam folder during testing

### PDF Not Attaching

1. **Check PDF Generation**: Download the PDF manually first to ensure it generates correctly
2. **Check Base64 Encoding**: Ensure the PDF is properly encoded to base64
3. **Check File Size**: Some email providers have attachment size limits (usually 10MB)

### Email Formatting Issues

1. **Test with Different Clients**: Gmail, Outlook, Apple Mail may render HTML differently
2. **Keep HTML Simple**: Use inline styles and basic HTML
3. **Test on Mobile**: Ensure emails look good on mobile devices

## Next Steps

1. **Custom Branding**: Add your company logo to the email template
2. **Email Tracking**: Implement open and click tracking
3. **Templates**: Create different email templates for different scenarios
4. **Scheduled Sending**: Add ability to schedule quote emails
5. **Follow-ups**: Implement automatic follow-up emails for un-responded quotes

## Support

For issues or questions:
- Check Supabase function logs
- Review email provider documentation
- Contact support at support@wyalink.com

## Security Notes

- Never expose your email API key in frontend code
- Always use Supabase Edge Functions or similar backend
- Implement rate limiting to prevent abuse
- Validate all email addresses before sending
- Use environment variables for all sensitive data
