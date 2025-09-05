const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://tabuloo.com",
  "https://www.tabuloo.com",
  "https://govupalu.com",
  "https://www.govupalu.com",
  "https://govupalu.vercel.app"
];

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  // Clear any existing CORS headers first to prevent duplicates
  res.removeHeader('Access-Control-Allow-Origin');
  res.removeHeader('Access-Control-Allow-Methods');
  res.removeHeader('Access-Control-Allow-Headers');
  res.removeHeader('Access-Control-Allow-Credentials');
  res.removeHeader('Vary');

  let isAllowed = false;
  if (!origin) {
    isAllowed = true; // non-browser or same-origin requests
  } else {
    try {
      const hostname = new URL(origin).hostname;
      isAllowed = allowedOrigins.includes(origin) || /\.vercel\.app$/.test(hostname) || hostname === 'localhost' || hostname === '127.0.0.1';
    } catch (_) {
      isAllowed = false;
    }
  }

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-razorpay-signature, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}