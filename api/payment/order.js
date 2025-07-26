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

  if (req.method === 'GET') {
    const { orderId } = req.query;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing orderId' });
    }
    try {
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