const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://forefight-health-backend-tharun9494-tharun9494s-projects.vercel.app',
  'https://forefight-patient.vercel.app',
  'https://www.govupalu.com',
  'https://govupalu.vercel.app',
  'https://govupalu.com',
  'https://forefight-health-backend.vercel.app/',
  'https://tabuloo-backend-p95l.vercel.app'
];

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  // Check if the origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('✅ Allowed origin:', origin);
  } else {
    // For debugging: log the origin that's not allowed
    console.log('❌ Blocked origin:', origin);
    console.log('📋 Allowed origins:', allowedOrigins);
    
    // For development, allow localhost origins even if not explicitly listed
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      console.log('✅ Allowed localhost origin:', origin);
    } else {
      // Set the main domain as fallback
      res.setHeader('Access-Control-Allow-Origin', 'https://www.govupalu.com');
      console.log('🔄 Using fallback origin: https://www.govupalu.com');
    }
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-razorpay-signature');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Log for debugging
  console.log('🔧 CORS headers set for origin:', origin);
}

export function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling preflight request for origin:', req.headers.origin);
    setCorsHeaders(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}