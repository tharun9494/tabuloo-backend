import crypto from 'crypto';
import { setCorsHeaders, handlePreflight } from './cors.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return; // Handles OPTIONS preflight

  setCorsHeaders(req, res); // Set CORS headers for all other requests

  if (req.method === 'POST') {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature 
      } = req.body;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment verification parameters'
        });
      }

      // Create signature for verification
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      // Verify signature
      if (razorpay_signature === expectedSign) {
        console.log('Payment verified successfully:', razorpay_payment_id);
        
        res.json({
          success: true,
          message: 'Payment verified successfully',
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id
        });
      } else {
        console.log('Payment verification failed:', razorpay_payment_id);
        
        res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 