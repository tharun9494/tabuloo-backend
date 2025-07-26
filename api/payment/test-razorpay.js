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

  try {
    // Check if credentials are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.json({
        success: false,
        message: 'Razorpay credentials not configured',
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
    }

    // Test Razorpay connection by fetching account details
    const razorpay = getRazorpayInstance();
    const account = await razorpay.accounts.fetch();
    
    res.json({
      success: true,
      message: 'Razorpay is working!',
      account: {
        id: account.id,
        name: account.name,
        email: account.email
      },
      key_id: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing'
    });

  } catch (error) {
    console.error('Razorpay test error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Razorpay test failed',
      error: error.message,
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
    });
  }
} 