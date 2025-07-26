const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://forefight-health-backend-tharun9494-tharun9494s-projects.vercel.app',
  'https://forefight-patient.vercel.app',
  'https://www.govupalu.com',
  'https://govupalu.vercel.app',
  'https://govupalu.com'
];

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  // Check if the request origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For debugging: log the origin that's not allowed
    console.log('Blocked origin:', origin);
   
    // Set a default origin for development (you can remove this in production)
    res.setHeader('Access-Control-Allow-Origin', 'https://www.govupalu.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-razorpay-signature');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}