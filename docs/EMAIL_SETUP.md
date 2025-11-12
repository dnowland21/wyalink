# Email Integration Setup Guide

This guide will help you set up the Office 365 email integration for WyaLink LinkOS.

## Overview

The email integration consists of:
1. **Settings Database Schema** - Stores email configuration
2. **Email API Service** - Node.js/Express service that sends emails via Office 365
3. **Settings Page** - Admin UI to configure email settings
4. **EmailForm Component** - Sends emails to leads and logs activities

## Prerequisites

- Office 365 account with SMTP access
- Supabase project with database access
- Node.js installed for the email API service

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

### 2. Configure Email API Service

Navigate to the email service directory and set up environment variables:

```bash
cd services/email-api
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
PORT=3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install Dependencies

If not already installed:

```bash
cd services/email-api
npm install
```

### 4. Start the Email API Service

```bash
cd services/email-api
node index.js
```

The service will start on port 3001. You should see:
```
Email API service running on port 3001
Health check: http://localhost:3001/health
```

### 5. Configure LinkOS App

Add the email API URL to your LinkOS environment variables (optional, defaults to localhost:3001):

```bash
# apps/linkos/.env
VITE_EMAIL_API_URL=http://localhost:3001
```

### 6. Configure Office 365 in Settings

1. Log in to LinkOS as an admin user
2. Navigate to **Settings** in the sidebar (admin-only)
3. Enter your Office 365 SMTP credentials:
   - **SMTP Host**: smtp.office365.com
   - **SMTP Port**: 587
   - **Email Address**: your-office365-email@company.com
   - **Password**: your-office365-password (or app-specific password if using 2FA)
   - **From Name**: WyaLink (or your preferred sender name)
4. Click **Save Settings**
5. Enable email sending by toggling **Enable Email Sending**

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

## API Endpoints

The email API service provides the following endpoints:

### POST /api/email/send
Send an email via Office 365

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "cc": "optional-cc@example.com",
  "bcc": "optional-bcc@example.com",
  "subject": "Email Subject",
  "content": "Email content (plain text or HTML)",
  "leadId": "optional-lead-id-for-tracking"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "<unique-message-id>",
  "message": "Email sent successfully"
}
```

### POST /api/email/test
Send a test email to verify configuration

**Request Body:**
```json
{
  "to": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "<unique-message-id>",
  "message": "Test email sent successfully"
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "service": "email-api"
}
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

## Security Considerations

1. **Credentials Storage**: Email credentials are stored in the Supabase database, accessible only to admins
2. **RLS Policies**: Settings table has Row Level Security policies restricting access to admins
3. **Server-Side Sending**: Emails are sent from the server (email-api) to keep credentials secure
4. **HTTPS**: In production, ensure the email API is served over HTTPS
5. **Environment Variables**: Keep Supabase credentials in .env files, never commit to version control

## Production Deployment

For production deployment:

1. **Deploy Email API Service** as a separate service (e.g., on Coolify, Docker, or cloud provider)
2. **Use HTTPS** for the email API endpoint
3. **Set Environment Variables** in your deployment platform
4. **Update VITE_EMAIL_API_URL** in LinkOS to point to production email API
5. **Consider Rate Limiting** to prevent email abuse
6. **Monitor Logs** for failed email attempts

## Troubleshooting

Check the email API service logs:
```bash
cd services/email-api
node index.js
# Watch for error messages when emails are sent
```

Check browser console in LinkOS for client-side errors.

Check Supabase logs for database-related issues.

## Support

For issues or questions about the email integration, contact your system administrator or refer to the Office 365 SMTP documentation.
