import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.govupalu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end(); // CORS preflight
    return;
  }

  if (req.method === 'POST') {
    try {
      // Check if Razorpay credentials are configured
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('Razorpay credentials not configured');
        return res.status(500).json({ 
          success: false, 
          message: 'Payment gateway not configured',
          error: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found'
        });
      }

      const { amount, currency = 'INR', receipt, notes } = req.body;
      
      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid amount is required (must be greater than 0)' 
        });
      }

      // Log the request for debugging
      console.log('Creating order with:', {
        amount: amount,
        currency: currency,
        receipt: receipt,
        notes: notes
      });

      const options = {
        amount: Math.round(amount * 100), // Ensure it's an integer
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {}
      };

      console.log('Razorpay options:', options);

      const order = await razorpay.orders.create(options);
      
      console.log('Order created successfully:', order.id);

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
      console.error('Razorpay order creation error:', error);
      
      // More detailed error response
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create order', 
        error: error.message,
        details: {
          code: error.code,
          description: error.description,
          field: error.field
        }
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 