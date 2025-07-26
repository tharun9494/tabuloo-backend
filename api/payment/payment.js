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
    const { paymentId } = req.query;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Missing paymentId' });
    }
    try {
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