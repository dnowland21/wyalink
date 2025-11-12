# Email Integration Setup Guide (Supabase Edge Functions)

This guide will help you set up the Office 365 email integration for WyaLink LinkOS using Supabase Edge Functions.

## Overview

The email integration consists of:
1. **Settings Database Schema** - Stores email configuration
2. **Supabase Edge Functions** - Serverless functions that send emails via Office 365
3. **Settings Page** - Admin UI to configure email settings
4. **EmailForm Component** - Sends emails to leads and logs activities

## Prerequisites

- Office 365 account with SMTP access
- Supabase project with database access
- Supabase CLI installed: `npm install -g supabase`

## Setup Steps

### 1. Database Setup

Run the settings schema SQL to create the settings table:

```bash
# Execute the SQL file in your Supabase SQL Editor
cat docs/settings_schema.sql
```

This creates:
- `settings` table with email configuration fields
- RLS policies for admin-only access
- Default Office 365 SMTP settings

### 2. Install Supabase CLI

```bash
npm install -g supabase
```

### 3. Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

You can find your project ref in your Supabase dashboard URL:
`https://app.supabase.com/project/[project-ref]`

### 4. Deploy Edge Functions

Deploy the email functions to your Supabase project:

```bash
# Deploy both functions
supabase functions deploy send-email
supabase functions deploy test-email
```

Or deploy all functions at once:
```bash
supabase functions deploy
```

### 5. Verify Deployment

Check that the functions are deployed:

```bash
supabase functions list
```

You should see:
- `send-email` - Sends emails to leads
- `test-email` - Tests email configuration

### 6. Configure Office 365 in Settings

1. Start your LinkOS app: `npm run dev`
2. Log in as an admin user
3. Navigate to **Settings** in the sidebar (admin-only)
4. Enter your Office 365 SMTP credentials:
   - **SMTP Host**: smtp.office365.com
   - **SMTP Port**: 587
   - **Email Address**: your-office365-email@company.com
   - **Password**: your-office365-password (or app-specific password if using 2FA)
   - **From Name**: WyaLink (or your preferred sender name)
5. Click **Save Settings**
6. Enable email sending by toggling **Enable Email Sending**

### 7. Test Email Configuration

In the Settings page:
1. Enter a test email address
2. Click **Send Test Email**
3. Check the recipient inbox for the test email

## Office 365 Setup Notes

### SMTP Settings
- **Host**: smtp.office365.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Security**: TLS/STARTTLS
- **Authentication**: Required

### Multi-Factor Authentication (2FA)

If you have 2FA enabled on your Office 365 account, you'll need to create an app-specific password:

1. Go to your Microsoft account security settings
2. Navigate to **Security** → **Advanced security options**
3. Under **App passwords**, create a new app password
4. Use this app password in the Settings page instead of your regular password

### Common Issues

**"Authentication failed"**
- Verify your email and password are correct
- If using 2FA, use an app-specific password
- Check that SMTP is enabled for your Office 365 account

**"Connection timeout"**
- Verify firewall settings allow outbound connections to smtp.office365.com
- Check that port 587 is not blocked
- Try port 465 with SSL enabled instead

**"Sender address rejected"**
- Ensure the "From Email Address" matches your Office 365 email
- Or leave it blank to use the SMTP username

## Edge Function Endpoints

Once deployed, your functions are available at:

**Production:**
- `https://[project-ref].supabase.co/functions/v1/send-email`
- `https://[project-ref].supabase.co/functions/v1/test-email`

**Local Development:**
- `http://localhost:54321/functions/v1/send-email`
- `http://localhost:54321/functions/v1/test-email`

## Local Development

To test Edge Functions locally:

```bash
# Start local Supabase (includes Edge Functions)
supabase start

# Your functions will be available at localhost:54321
```

## Usage in LinkOS

### Sending Emails to Leads

1. Navigate to a lead profile page
2. Click the **Send Email** tab
3. Fill in the email details
4. Click **Send Email**

The email will:
- Be sent via Office 365 using configured SMTP settings
- Be logged in the lead's activity timeline
- Show as "Email Sent" with timestamp
- Include the full email content for reference

### Viewing Email History

All sent emails appear in the lead's activity timeline with:
- Email subject and content
- Recipient addresses (To, CC, BCC)
- Sent timestamp
- User who sent the email

## Architecture

```
React App (LinkOS)
    ↓
Supabase Client (supabase.functions.invoke)
    ↓
Edge Function (Deno Runtime)
    ↓
Settings Table (fetch SMTP config)
    ↓
Office 365 SMTP (smtp.office365.com:587)
    ↓
Email Delivered
```

## Security Considerations

1. **Serverless Security**: Edge Functions run in isolated Deno environments
2. **Authentication Required**: All function calls require valid Supabase JWT token
3. **Admin-Only Access**: Settings table has RLS policies restricting access to admins
4. **Credentials Storage**: SMTP credentials stored in database, never exposed to client
5. **Auto-scaling**: Functions auto-scale with usage, no server to manage

## Advantages Over Express API

The Supabase Edge Functions approach provides several benefits over a separate Express API:

1. **No Separate Deployment** - Functions deploy with your Supabase project
2. **Built-in Authentication** - Automatic JWT verification
3. **Auto-scaling** - Scales automatically based on demand
4. **Better Security** - Isolated execution environment
5. **Lower Cost** - Pay only for invocations, no always-on server
6. **Simpler Architecture** - One platform instead of two
7. **Global Distribution** - Edge Functions run close to users

## Monitoring and Logs

View function logs:

```bash
# Real-time logs
supabase functions logs send-email --follow
supabase functions logs test-email --follow

# Recent logs
supabase functions logs send-email
```

## Troubleshooting

### Functions not working

1. Verify functions are deployed:
```bash
supabase functions list
```

2. Check function logs:
```bash
supabase functions logs send-email
```

3. Test with curl:
```bash
curl -i --location --request POST \
  'https://[project-ref].supabase.co/functions/v1/test-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to": "test@example.com"}'
```

### Email not sending

1. Check Settings page - ensure email sending is enabled
2. Verify Office 365 credentials are correct
3. Check function logs for SMTP errors
4. Test SMTP connection manually

### Permission errors

1. Verify user is authenticated (check JWT token)
2. For test-email, ensure user has admin role
3. Check RLS policies on settings table

## Next Steps

- Configure Office 365 credentials in the Settings page
- Send test emails to verify configuration
- Start sending emails to leads from lead profile pages
- Monitor function logs for any issues

For more details on Edge Functions, see [supabase/functions/README.md](../supabase/functions/README.md).
