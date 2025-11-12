# WyaLink Supabase Edge Functions

This directory contains Supabase Edge Functions for WyaLink LinkOS.

## Functions

### send-email
Sends emails to leads via Office 365 SMTP. Reads email configuration from the settings table.

**Endpoint:** `/functions/v1/send-email`

**Request:**
```json
{
  "to": "recipient@example.com",
  "cc": "optional-cc@example.com",
  "bcc": "optional-bcc@example.com",
  "subject": "Email Subject",
  "content": "Email content",
  "leadId": "optional-lead-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### test-email
Sends a test email to verify Office 365 configuration. Admin-only.

**Endpoint:** `/functions/v1/test-email`

**Request:**
```json
{
  "to": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

## Development

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

### Local Development

Start local Supabase services including Edge Functions:
```bash
supabase start
```

Your functions will be available at:
- `http://localhost:54321/functions/v1/send-email`
- `http://localhost:54321/functions/v1/test-email`

### Testing Locally

You can test the functions with curl:

**Test send-email:**
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "test@example.com",
    "subject": "Test Email",
    "content": "This is a test email"
  }'
```

**Test test-email:**
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/test-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "test@example.com"
  }'
```

## Deployment

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Specific Function

```bash
supabase functions deploy send-email
supabase functions deploy test-email
```

### Set Environment Variables (if needed)

If your functions need additional environment variables:

```bash
supabase secrets set MY_SECRET=my-value
```

View current secrets:
```bash
supabase secrets list
```

## Usage from Client

The Edge Functions are automatically called from the LinkOS app using the Supabase JavaScript client:

```typescript
import { supabase } from '@wyalink/supabase-client'

// Send email
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'recipient@example.com',
    subject: 'Hello',
    content: 'Email content',
  },
})

// Test email configuration
const { data, error } = await supabase.functions.invoke('test-email', {
  body: { to: 'test@example.com' },
})
```

## Security

- All functions require authentication (Bearer token)
- `test-email` function verifies admin role before sending
- Email credentials are stored in the database settings table
- SMTP credentials are never exposed to the client

## Dependencies

The functions use these Deno libraries:
- `std@0.168.0/http/server.ts` - HTTP server
- `@supabase/supabase-js@2` - Supabase client
- `denomailer@1.6.0` - SMTP email sending (Deno port of nodemailer)

## Troubleshooting

### Function not found
Make sure the function is deployed:
```bash
supabase functions list
```

### Authentication errors
Ensure the Authorization header includes a valid Supabase JWT token.

### SMTP connection errors
- Verify email settings in the settings table
- Check that Office 365 credentials are correct
- Ensure port 587 (STARTTLS) or 465 (SSL) is not blocked

### View function logs
```bash
supabase functions logs send-email
supabase functions logs test-email
```

## Architecture

```
Client (React App)
    ↓
Supabase Client (supabase.functions.invoke)
    ↓
Edge Function (Deno Runtime)
    ↓
Settings Table (get SMTP config)
    ↓
Office 365 SMTP Server
```

## Migration from Express API

If you previously used the Express-based email-api service, the Edge Functions provide the same functionality but with these advantages:

1. **No separate deployment** - Functions deploy with your Supabase project
2. **Better security** - Built-in authentication and RLS
3. **Auto-scaling** - Scales automatically with usage
4. **Simpler architecture** - No need to manage a separate Node.js service
5. **Lower cost** - Pay only for function invocations

The client code has been updated to use `supabase.functions.invoke()` instead of `fetch()` calls to the Express API.
