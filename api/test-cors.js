import { setCorsHeaders, handlePreflight } from './payment/cors.js';

export default function handler(req, res) {
  if (handlePreflight(req, res)) return;

  setCorsHeaders(req, res);

  if (req.method === 'GET') {
    res.json({
      success: true,
      message: 'CORS test successful',
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 