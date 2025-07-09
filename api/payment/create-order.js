import Razorpay from 'razorpay';
import { setCorsHeaders, handlePreflight } from './cors.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default async function handler(req, res) {
  // Handle preflight requests
  if (handlePreflight(req, res)) return;

  // Set CORS headers for all responses
  setCorsHeaders(req, res);
  if (req.method === 'POST') {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }
    const options = {
      amount: amount * 100,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };
    try {
      const order = await razorpay.orders.create(options);
      res.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          created_at: order.created_at
        },
        key_id: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 