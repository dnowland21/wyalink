# Quote Email Service Setup Guide

This guide explains how the quote email functionality works in WyaLink LinkOS.

## Overview

The quote email functionality allows you to:
- Send branded emails to customers with quote details
- Attach professionally formatted PDF quotes
- Track when quotes are sent
- Automatically update quote status

## How It Works

Quote emails use the **same email service** as lead emails. This means:

✅ **No additional setup required** if you're already sending lead emails
✅ Uses your existing Office 365 SMTP configuration
✅ Sends from the same email address configured in Settings
✅ Same branding and professional appearance

## Architecture

```
SendQuoteModal → Email API Service → Office 365 SMTP → Customer
     ↓
  Updates Quote Status in Supabase
```

The email service is a separate Node.js/Express API that:
1. Fetches your Office 365 SMTP credentials from Supabase
2. Generates branded HTML emails with WyaLink colors
3. Attaches the PDF quote (if selected)
4. Sends via Office 365 SMTP
5. Returns success/failure to the frontend

## Email Template

Quote emails automatically include:

### Header
- WyaLink branding with blue/teal gradient
- Company tagline "Your Wireless Provider"

### Body
- Custom message from the Send Quote modal
- Professional formatting with proper line breaks
- Easy-to-read layout

### Footer
- Company contact information
- Website link

### PDF Attachment (Optional)
- Letter-size (8.5" x 11") professionally formatted PDF
- Quote number, customer info, items, totals
- WyaLink branding with teal accent color
- Nunito font throughout

## Prerequisites

To send quote emails, you need:

1. **Email API Service Running**
   - The service at `services/email-api` must be deployed
   - See `services/email-api/COOLIFY_DEPLOYMENT.md` for deployment instructions

2. **Office 365 SMTP Configured**
   - Configure in LinkOS: Settings → Email Settings
   - Same configuration used for lead emails

3. **Environment Variable Set**
   - `VITE_EMAIL_API_URL` must point to your email service
   - Production: `https://email-api.wyalink.com`
   - Local dev: `http://localhost:3001`

## Testing

### Check if Email Service is Running

```bash
# Test the health endpoint
curl https://email-api.wyalink.com/health

# Should return:
{"status":"ok","service":"email-api"}
```

### Send a Test Quote

1. Create a draft quote in LinkOS
2. Click "Send to Customer"
3. Fill in recipient email and message
4. Optionally include PDF attachment
5. Click "Send Quote"

The email should:
- ✅ Be sent from your configured Office 365 account
- ✅ Have WyaLink branding in header/footer
- ✅ Include your custom message
- ✅ Have PDF attached (if selected)
- ✅ Update quote status to "Sent"

## Troubleshooting

### Error: "Failed to load resource: 404"

**Cause:** Email API service is not running or `VITE_EMAIL_API_URL` is incorrect

**Fix:**
1. Verify email service is deployed: `curl https://email-api.wyalink.com/health`
2. Check `VITE_EMAIL_API_URL` environment variable in LinkOS
3. Restart email service if needed

### Error: "Email sending is disabled in settings"

**Cause:** Email settings not configured in LinkOS

**Fix:**
1. Go to Settings → Email Settings
2. Enable "Email Sending"
3. Configure Office 365 SMTP credentials
4. Test connection

### Error: "Missing required fields"

**Cause:** Recipient email, subject, or message is empty

**Fix:**
1. Ensure all required fields are filled
2. Check that customer/lead has an email address

### Error: "Failed to send email" (SMTP error)

**Cause:** Office 365 SMTP connection issue

**Fix:**
1. Verify SMTP credentials in Settings
2. Check SMTP username/password are correct
3. Ensure Office 365 account allows SMTP access
4. Check firewall allows outbound connections on port 587

### PDF Not Generating

**Cause:** PDF generation error in browser

**Fix:**
1. Check browser console for errors
2. Ensure quote has all required data (items, customer info)
3. Try downloading PDF manually first to test generation

## Email Service Endpoint

The quote email uses: `POST /api/email/send-quote`

**Request Body:**
```json
{
  "to": "customer@example.com",
  "subject": "Your Quote from WyaLink - #Q-001",
  "message": "Hello...",
  "quoteNumber": "Q-001",
  "includePDF": true,
  "pdfBase64": "JVBERi0xLjQK...",
  "pdfFileName": "WyaLink-Quote-Q-001.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "abc123@mail.outlook.com",
  "message": "Quote email sent successfully"
}
```

## Security

- ✅ SMTP credentials never sent to client
- ✅ Credentials stored encrypted in Supabase
- ✅ Email service uses service role key (bypasses RLS)
- ✅ HTTPS enforced in production
- ✅ PDF generated client-side, sent as base64

## Customization

### Customize Email Template

Edit the HTML template in `services/email-api/index.js` at the `/api/email/send-quote` endpoint:

```javascript
const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <!-- Customize this HTML -->
  </div>
`
```

### Customize PDF Template

Edit the PDF template in `apps/linkos/src/components/QuotePDF.tsx`:

- Change colors in `COLORS` constant
- Modify styles in `StyleSheet.create()`
- Update layout in the component JSX

### Customize Default Message

Edit the default message in `apps/linkos/src/components/SendQuoteModal.tsx`:

```typescript
const [message, setMessage] = useState(`
  // Your custom default message here
`)
```

## Production Deployment

The quote email functionality works automatically if:

1. ✅ Email API service is deployed and running
2. ✅ `VITE_EMAIL_API_URL` is set in LinkOS environment
3. ✅ Office 365 SMTP is configured in Settings
4. ✅ Email sending is enabled in Settings

No additional deployment steps needed beyond the initial email service setup.

## Local Development

To run the email service locally:

```bash
# Navigate to email service
cd services/email-api

# Install dependencies
npm install

# Create .env file with:
# VITE_SUPABASE_URL=your-supabase-url
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# PORT=3001

# Start the service
npm start
```

Then in LinkOS `.env.local`:
```
VITE_EMAIL_API_URL=http://localhost:3001
```

## Support

For issues or questions:
- Check email service logs for detailed error messages
- Review Office 365 SMTP configuration in Settings
- Verify email service health endpoint
- Contact support at support@wyalink.com

## Related Documentation

- Email API Service Deployment: `services/email-api/COOLIFY_DEPLOYMENT.md`
- Email API Service Setup: `docs/EMAIL_SETUP.md`
- Office 365 Configuration: Settings → Email Settings in LinkOS
