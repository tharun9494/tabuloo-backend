import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Expect the following env vars to be configured in Vercel project settings:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true" or "false")

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html } = req.body || {};
    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Check if SMTP environment variables are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP environment variables not configured');
      return res.status(500).json({ 
        ok: false, 
        error: 'Email service not configured. Please contact administrator.',
        details: 'SMTP environment variables are missing'
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@tabuloo.app';

    await transporter.sendMail({
      from: `Tabuloo <${fromAddress}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully to:', to);
    return res.status(200).json({ ok: true, message: 'Email sent successfully' });
    
  } catch (error) {
    console.error('Email send failed:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send email';
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Email authentication failed. Please check SMTP credentials.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to email server. Please check SMTP configuration.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Email server not found. Please check SMTP host configuration.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return res.status(500).json({ 
      ok: false, 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}