# Email API Service

This directory contains the email service for the Tabuloo application.

## Files

- `server.js` - Express server for email API (standalone server)
- `test-email.js` - Email configuration testing script
- `../api/email/send-email.ts` - Vercel serverless function for email sending

## Usage

### Running the Email Server (Development)
```bash
npm run email-dev
```

### Running the Email Server (Production)
```bash
npm run email-server
```

### Testing Email Configuration
```bash
npm run test-email
```

## Environment Variables

Make sure to set up the following environment variables in `.env` or `.env.local`:

```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
SMTP_SECURE=false
FROM_EMAIL=no-reply@tabuloo.app
```

## API Endpoints

### POST /send-email
Sends an email using the configured SMTP settings.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<h1>Email content in HTML</h1>"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Email sent successfully"
}
```

### GET /health
Health check endpoint to verify the service is running.

**Response:**
```json
{
  "ok": true,
  "message": "Email API server is running"
}
```
