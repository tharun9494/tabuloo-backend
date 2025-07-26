import { setCorsHeaders, handlePreflight } from './payment/cors.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return; // Handles OPTIONS preflight

  setCorsHeaders(req, res); // Set CORS headers for all other requests

  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    origin: req.headers.origin
  });
} 