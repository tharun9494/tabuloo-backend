import Razorpay from 'razorpay';
import { setCorsHeaders, handlePreflight } from './cors.js';

// Delay utility function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    const { paymentId, delayMs } = req.query;
    
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Missing paymentId' });
    }
    
    try {
      // Add delay if requested
      if (delayMs) {
        const delayTime = parseInt(delayMs);
        console.log(`Adding delay of ${delayTime}ms before processing payment...`);
        await delay(delayTime);
      }
      
      const razorpay = getRazorpayInstance();
      const payment = await razorpay.payments.fetch(paymentId);
      res.json({
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          order_id: payment.order_id,
          created_at: payment.created_at
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch payment details', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 