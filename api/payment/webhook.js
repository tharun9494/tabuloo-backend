import crypto from 'crypto';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.govupalu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end(); // CORS preflight
    return;
  }

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