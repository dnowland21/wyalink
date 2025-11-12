# WyaLink Email API Service

Express.js microservice for sending emails via Office 365 SMTP using nodemailer.

## Features

- Send emails via Office 365 SMTP
- Test email configuration
- Reads email settings from Supabase database
- CORS enabled for cross-origin requests
- Health check endpoint for monitoring

## Prerequisites

- Node.js 18+ or 20+
- Supabase database with settings table
- Office 365 account with SMTP access

## Installation

```bash
cd services/email-api
npm install
```

## Configuration

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
VITE_SUPABASE_URL=https://data.wyalink.com
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Development

Start the service in development mode:

```bash
npm run dev
```

Or from the root of the monorepo:

```bash
npm run email-api
```

The service will start on http://localhost:3001

## Production

Start the service in production:

```bash
npm start
```

Or use Docker:

```bash
docker build -t wyalink-email-api .
docker run -p 3001:3001 \
  -e VITE_SUPABASE_URL=https://data.wyalink.com \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  wyalink-email-api
```

## API Endpoints

### POST /api/email/send

Send an email via Office 365.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "cc": "optional-cc@example.com",
  "bcc": "optional-bcc@example.com",
  "subject": "Email Subject",
  "content": "Email content (plain text)",
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

**Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

### POST /api/email/test

Send a test email to verify configuration.

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

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "email-api"
}
```

## How It Works

1. Client (LinkOS app) calls API endpoint
2. Service fetches email settings from Supabase `settings` table
3. Service creates nodemailer SMTP transport with Office 365 settings
4. Email is sent via Office 365 SMTP
5. Response returned to client

## Email Settings

Email configuration is stored in the Supabase `settings` table with category `email`:

- `email.enabled` - Enable/disable email sending
- `email.smtp.host` - SMTP hostname (smtp.office365.com)
- `email.smtp.port` - SMTP port (587 or 465)
- `email.smtp.secure` - Use SSL (true/false)
- `email.smtp.username` - Office 365 email address
- `email.smtp.password` - Office 365 password
- `email.from.name` - Sender name
- `email.from.address` - Sender email address

Configure these via the LinkOS Settings page (admin only).

## Security

- SMTP credentials stored in database, never in code
- Service validates required fields
- CORS enabled (configure origins as needed)
- Health check for monitoring

**Note:** Currently no authentication on the API endpoints. Consider adding:
- API key authentication
- IP whitelist
- Rate limiting

## Deployment

See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for Coolify deployment instructions.

### Coolify Quick Deploy

1. Push code to git repository
2. Create new Application in Coolify
3. Set base directory: `services/email-api`
4. Set build command: `npm install`
5. Set start command: `node index.js`
6. Add environment variables
7. Deploy

### Docker Deployment

```bash
docker build -t wyalink-email-api .
docker run -d -p 3001:3001 \
  --name email-api \
  -e PORT=3001 \
  -e VITE_SUPABASE_URL=https://data.wyalink.com \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  --restart unless-stopped \
  wyalink-email-api
```

## Troubleshooting

### Email not sending

1. Check service logs
2. Verify Office 365 credentials in Settings
3. Test SMTP connection manually
4. Check firewall (port 587/465 must be open)

### Service won't start

1. Check Node.js version (18+ required)
2. Verify environment variables
3. Check Supabase connection

### CORS errors

Configure allowed origins in `index.js`:
```javascript
app.use(cors({
  origin: ['https://linkos.wyalink.com']
}))
```

## Development Tips

### Test locally with curl

```bash
# Health check
curl http://localhost:3001/health

# Send test email
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'

# Send email
curl -X POST http://localhost:3001/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "content": "This is a test email"
  }'
```

### Watch logs

```bash
npm run dev  # Auto-restarts on file changes
```

## License

Proprietary - WyaLink
