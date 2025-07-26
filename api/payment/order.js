import Razorpay from 'razorpay';
import { setCorsHeaders, handlePreflight } from './cors.js';

// Function to initialize Razorpay instance
function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured. Please check your environment variables.');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return; // Handles OPTIONS preflight

  setCorsHeaders(req, res); // Set CORS headers for all other requests

  if (req.method === 'GET') {
    const { orderId } = req.query;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing orderId' });
    }
    try {
      const razorpay = getRazorpayInstance();
      const order = await razorpay.orders.fetch(orderId);
      res.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          receipt: order.receipt,
          created_at: order.created_at
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch order details', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 