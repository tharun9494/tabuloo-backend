import crypto from 'crypto';
import { setCorsHeaders, handlePreflight } from './cors.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return; // Handles OPTIONS preflight

  setCorsHeaders(req, res); // Set CORS headers for all other requests

  if (req.method === 'POST') {
    try {
      const webhookBody = JSON.stringify(req.body);
      const webhookSignature = req.headers['x-razorpay-signature'];

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
        .update(webhookBody)
        .digest('hex');

      if (webhookSignature === expectedSignature) {
        const event = req.body.event;
        const paymentEntity = req.body.payload.payment.entity;
        
        console.log('Webhook received:', event);
        console.log('Payment ID:', paymentEntity.id);
        
        // Handle different webhook events
        switch (event) {
          case 'payment.captured':
            console.log('Payment captured:', paymentEntity.id);
            // Add your business logic here
            break;
          case 'payment.failed':
            console.log('Payment failed:', paymentEntity.id);
            // Add your business logic here
            break;
          default:
            console.log('Unhandled event:', event);
        }
        
        res.json({ received: true });
      } else {
        console.log('Invalid webhook signature');
        res.status(400).json({ error: 'Invalid signature' });
      }

    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 