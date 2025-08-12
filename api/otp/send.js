import { setCorsHeaders, handlePreflight } from '../payment/cors.js';
import TwilioSMSService from './sms-service.js';

// Initialize Twilio SMS service
const smsService = new TwilioSMSService();

// In-memory storage for development (use Redis/Database in production)
const otpStore = new Map();

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with expiration
function storeOTP(identifier, otp) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(identifier, {
    otp,
    expiresAt,
    attempts: 0,
    created: Date.now()
  });
}

// Send SMS using Twilio service
async function sendSMS(phone, otp) {
  return await smsService.sendOTP(phone, otp);
}

// Make otpStore accessible globally for other modules
global.otpStore = otpStore;

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  if (req.method === 'POST') {
    try {
      const { identifier } = req.body;

      // Validate required fields
      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }

      // Validate phone number format
      const phoneRegex = /^[+]?[0-9]{10,15}$/;
      if (!phoneRegex.test(identifier)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }

      // Check rate limiting
      const existing = otpStore.get(identifier);
      if (existing && existing.expiresAt > Date.now()) {
        const timeLeft = Math.ceil((existing.expiresAt - Date.now()) / 1000);
        if (timeLeft > 240) { // Allow resend only in last 60 seconds
          return res.status(429).json({
            success: false,
            message: `Please wait ${timeLeft} seconds before requesting new OTP`
          });
        }
      }

      // Generate OTP
      const otp = generateOTP();
      
      // Store OTP
      storeOTP(identifier, otp);

      // Send SMS
      const sent = await sendSMS(identifier, otp);

      if (sent) {
        console.log(`✅ OTP sent successfully to ${identifier}`);
        res.json({
          success: true,
          message: 'OTP sent successfully to phone number',
          expiresIn: 300, // 5 minutes in seconds
          // Include OTP for testing (remove in production)
          otp
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send OTP'
        });
      }

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
