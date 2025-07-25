import crypto from 'crypto';
import { setCorsHeaders, handlePreflight } from './cors.js';

export default function handler(req, res) {
  if (handlePreflight(req, res)) return; // Handles OPTIONS preflight

  setCorsHeaders(req, res); // Set CORS headers for all other requests

  if (req.method === 'POST') {
    const webhookBody = JSON.stringify(req.body);
    const webhookSignature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(webhookBody)
      .digest('hex');
    if (webhookSignature === expectedSignature) {
      const event = req.body.event;
      const paymentEntity = req.body.payload?.payment?.entity;
      // Handle different webhook events here
      res.json({ received: true });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 