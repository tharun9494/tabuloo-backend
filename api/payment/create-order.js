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

  if (req.method === 'POST') {
    try {
      const { amount, currency = 'INR', receipt, notes } = req.body;

      // Validate required fields
      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Amount is required'
        });
      }

      // Initialize Razorpay instance
      const razorpay = getRazorpayInstance();

      // Create order options
      const options = {
        amount: amount * 100, // Convert to paise (smallest currency unit)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {}
      };

      // Create order with Razorpay
      const order = await razorpay.orders.create(options);

      console.log('Order created:', order.id);

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
      console.error('Order creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 