import { setCorsHeaders, handlePreflight } from '../payment/cors.js';

// Validate session token
function validateSessionToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is not too old (e.g., 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - payload.timestamp > maxAge) {
      return { valid: false, message: 'Session expired' };
    }

    // Verify required fields
    if (!payload.identifier || !payload.verified || !payload.timestamp) {
      return { valid: false, message: 'Invalid session token format' };
    }

    return { 
      valid: true, 
      data: payload,
      message: 'Session is valid' 
    };
  } catch (error) {
    return { valid: false, message: 'Invalid session token' };
  }
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  if (req.method === 'POST') {
    try {
      const { sessionToken } = req.body;
      const authHeader = req.headers.authorization;

      // Get token from body or Authorization header
      const token = sessionToken || (authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null);

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Session token is required'
        });
      }

      // Validate session
      const validation = validateSessionToken(token);

      if (validation.valid) {
        console.log(`✅ Session validated for ${validation.data.identifier}`);
        
        res.json({
          success: true,
          message: validation.message,
          valid: true,
          data: {
            identifier: validation.data.identifier,
            verified: validation.data.verified,
            timestamp: validation.data.timestamp,
            sessionId: validation.data.sessionId
          }
        });
      } else {
        console.log(`❌ Session validation failed: ${validation.message}`);
        
        res.status(401).json({
          success: false,
          message: validation.message,
          valid: false
        });
      }

    } catch (error) {
      console.error('Validate session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate session',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
