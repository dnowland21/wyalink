# Email API Service - Coolify Deployment Guide

This guide will help you deploy the WyaLink Email API service to Coolify.

## Overview

The Email API service is a Node.js/Express microservice that handles email sending via Office 365 SMTP. It needs to run separately from your frontend apps to keep SMTP credentials secure.

## Prerequisites

- Coolify instance running
- Access to your Coolify dashboard
- Git repository (GitHub, GitLab, etc.)
- Your self-hosted Supabase URL and anon key

## Deployment Steps

### 1. Push Code to Repository

Make sure your `services/email-api` directory is in your git repository and pushed:

```bash
git add services/email-api
git commit -m "Add email API service"
git push
```

### 2. Create New Application in Coolify

1. Log in to your Coolify dashboard
2. Click **+ New** → **Application**
3. Select your **Git Repository**
4. Choose the repository containing your WyaLink code
5. Set the **Branch** (e.g., `main`)

### 3. Configure Build Settings

In the application settings:

**Build Pack:** `Dockerfile`

**Dockerfile Location:** `services/email-api/Dockerfile`

**Port:** `3001`

Coolify will automatically detect and use the Dockerfile to build the image.

### 4. Set Environment Variables

Add the following environment variables in Coolify:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `PORT` | `3001` | Port the service runs on |
| `VITE_SUPABASE_URL` | `https://data.wyalink.com` | Your Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Service role key (bypasses RLS) |
| `NODE_ENV` | `production` | Node environment |

### 5. Configure Domain (Optional)

If you want a custom domain for the email API:

1. Go to **Domains** section
2. Add a domain like: `email-api.wyalink.com`
3. Configure DNS:
   - Type: `A` or `CNAME`
   - Point to your Coolify server IP

Or use the Coolify-provided domain: `https://[app-name].[coolify-domain]`

### 6. Deploy

1. Click **Deploy** button
2. Wait for build to complete
3. Check logs for: `Email API service running on port 3001`

### 7. Update LinkOS Environment Variable

After deployment, update your LinkOS app environment variable:

**In Coolify (LinkOS app):**
```
VITE_EMAIL_API_URL=https://email-api.wyalink.com
```

Or if using Coolify subdomain:
```
VITE_EMAIL_API_URL=https://[app-name].[coolify-domain]
```

**For local development** (`.env.local` in `apps/linkos`):
```
VITE_EMAIL_API_URL=http://localhost:3001
```

### 8. Test Deployment

Test the health endpoint:

```bash
curl https://email-api.wyalink.com/health
```

Should return:
```json
{"status":"ok","service":"email-api"}
```

## Build Process

Coolify will use the included Dockerfile to:

1. Use Node.js 20 Alpine (lightweight image)
2. Install production dependencies only
3. Copy application source
4. Expose port 3001
5. Add health check endpoint
6. Start the server with `node index.js`

The Dockerfile is already created at `services/email-api/Dockerfile`.

## Production Checklist

- [ ] Service deploys successfully
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Environment variables are set
- [ ] HTTPS is enabled (Coolify handles this automatically)
- [ ] LinkOS app has correct `VITE_EMAIL_API_URL`
- [ ] Configure Office 365 credentials in LinkOS Settings page
- [ ] Send test email to verify

## Troubleshooting

### Service won't start

Check logs in Coolify:
- Look for npm install errors
- Verify Node version compatibility (requires Node 18+)
- Check environment variables are set

### Can't connect to Supabase

- Verify `VITE_SUPABASE_URL` is correct
- Verify `VITE_SUPABASE_ANON_KEY` is correct
- Check network connectivity from Coolify server to Supabase

### Emails not sending

1. Check service logs for SMTP errors
2. Verify Office 365 credentials in Settings page
3. Test SMTP connection manually
4. Check firewall rules (port 587 or 465 must be open)

### CORS errors

The service includes CORS middleware that allows all origins. If you need to restrict:

Edit `services/email-api/index.js`:
```javascript
app.use(cors({
  origin: ['https://linkos.wyalink.com', 'https://wyalink.com']
}))
```

## Monitoring

### View Logs

In Coolify:
1. Go to your email-api application
2. Click **Logs** tab
3. Watch for errors or email sending activity

### Health Check

Coolify can monitor the `/health` endpoint:
- **Health Check Path:** `/health`
- **Health Check Interval:** `30` seconds
- **Expected Response:** `200 OK`

## Security Notes

- ✅ SMTP credentials stored in database, never in code
- ✅ Service requires authentication (checks Supabase JWT would be better, but not implemented)
- ✅ HTTPS automatically enabled by Coolify
- ✅ Credentials never sent to client
- ⚠️ Consider adding API key authentication between LinkOS and email service
- ⚠️ Consider rate limiting to prevent abuse

## Scaling

If you need to handle more email traffic:

1. **Horizontal Scaling**: Deploy multiple instances in Coolify
2. **Queue System**: Add Bull/Redis for email queue
3. **Rate Limiting**: Add rate limiting middleware
4. **Monitoring**: Add logging service (e.g., Sentry)

## Updating

To update the email service:

1. Push code changes to git
2. Coolify will auto-deploy (if enabled)
3. Or manually click **Deploy** in Coolify

## Backup Plan

If the email service goes down:
- Emails will fail to send
- Users will see error messages
- Email activities will NOT be logged to database

Consider:
- Setting up health monitoring/alerts
- Having a backup SMTP service ready
- Implementing retry logic in the client

## Next Steps

After deployment:
1. Configure Office 365 SMTP in LinkOS Settings
2. Test sending emails to leads
3. Monitor logs for any issues
4. Set up alerts for service downtime

## Support

For issues:
- Check Coolify logs first
- Verify environment variables
- Test service health endpoint
- Check email service documentation: `/services/email-api/README.md`
