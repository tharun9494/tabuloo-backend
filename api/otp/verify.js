import { setCorsHeaders, handlePreflight } from '../payment/cors.js';
import crypto from 'crypto';

// Access the global otpStore
function getOtpStore() {
  global.otpStore = global.otpStore || new Map();
  return global.otpStore;
}

// Verify OTP
function verifyOTP(identifier, providedOtp) {
  const otpStore = getOtpStore();
  const stored = otpStore.get(identifier);
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (stored.expiresAt < Date.now()) {
    otpStore.delete(identifier);
    return { valid: false, message: 'OTP has expired' };
  }

  if (stored.attempts >= 3) {
    otpStore.delete(identifier);
    return { valid: false, message: 'Maximum attempts exceeded' };
  }

  stored.attempts++;

  if (stored.otp === providedOtp) {
    otpStore.delete(identifier); // Remove OTP after successful verification
    return { valid: true, message: 'OTP verified successfully' };
  } else {
    return { valid: false, message: 'Invalid OTP' };
  }
}

// Generate session token after successful OTP verification
function generateSessionToken(identifier) {
  const payload = {
    identifier,
    verified: true,
    timestamp: Date.now(),
    sessionId: crypto.randomBytes(16).toString('hex')
  };
  
  // In production, use proper JWT with secret key
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  if (req.method === 'POST') {
    try {
      const { identifier, otp } = req.body;

      // Validate required fields
      if (!identifier || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Phone number/email and OTP are required'
        });
      }

      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          success: false,
          message: 'OTP must be 6 digits'
        });
      }

      // Verify OTP
      const verification = verifyOTP(identifier, otp);

      if (verification.valid) {
        // Generate session token
        const sessionToken = generateSessionToken(identifier);
        
        console.log(`✅ OTP verified successfully for ${identifier}`);
        
        res.json({
          success: true,
          message: verification.message,
          sessionToken,
          verified: true,
          identifier: identifier
        });
      } else {
        console.log(`❌ OTP verification failed for ${identifier}: ${verification.message}`);
        
        res.status(400).json({
          success: false,
          message: verification.message,
          verified: false
        });
      }

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
