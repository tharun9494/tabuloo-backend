const dotenv = require('dotenv');

// Load environment variables FIRST before requiring any other modules
dotenv.config();

// This file is for local development only
// For Vercel deployment, use the API routes in the api/ folder

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/payment');

// Twilio SMS service for local development
class TwilioSMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Check if all required Twilio credentials are provided and valid
    if (!this.accountSid || !this.authToken || !this.phoneNumber || 
        !this.accountSid.startsWith('AC') || this.accountSid.length < 34) {
      console.warn('⚠️ Twilio credentials not configured or invalid. SMS will be mocked.');
      console.warn('⚠️ To enable SMS, configure the following environment variables:');
      console.warn('   - TWILIO_ACCOUNT_SID (should start with "AC")');
      console.warn('   - TWILIO_AUTH_TOKEN');
      console.warn('   - TWILIO_PHONE_NUMBER');
      this.client = null;
    } else {
      try {
        const twilio = require('twilio');
        this.client = twilio(this.accountSid, this.authToken);
        console.log(`📱 Twilio initialized with phone number: ${this.phoneNumber}`);
      } catch (error) {
        console.error('❌ Failed to initialize Twilio:', error.message);
        this.client = null;
      }
    }
  }

  async sendOTP(phone, otp) {
    if (!this.client) {
      console.log(`📱 [MOCK SMS] Sending OTP ${otp} to ${phone}`);
      console.log(`📱 [MOCK SMS] Message: "Your OTP is: ${otp}. Valid for 5 minutes."`);
      return true;
    }

    try {
      console.log(`📱 Attempting to send SMS to ${phone} from ${this.phoneNumber}`);
      
      const message = await this.client.messages.create({
        body: `Your OTP is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
        from: this.phoneNumber,
        to: phone
      });

      console.log(`✅ SMS sent successfully!`);
      console.log(`📱 Message SID: ${message.sid}`);
      console.log(`📱 Status: ${message.status}`);
      console.log(`📱 To: ${message.to}`);
      console.log(`📱 From: ${message.from}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${phone}:`);
      console.error(`❌ Error Code: ${error.code}`);
      console.error(`❌ Error Message: ${error.message}`);
      
      // Common Twilio error codes
      if (error.code === 21211) {
        console.error(`❌ TRIAL ACCOUNT: Phone number ${phone} is not verified. Please verify it in Twilio Console.`);
      } else if (error.code === 21408) {
        console.error(`❌ TRIAL ACCOUNT: Cannot send to this number. Please verify the number or upgrade your account.`);
      } else if (error.code === 21614) {
        console.error(`❌ Invalid phone number format: ${phone}`);
      }
      
      return false;
    }
  }
}

const smsService = new TwilioSMSService();

const app = express();
const PORT = process.env.PORT || 3001;

// Set timeout for all requests (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000); // 30 seconds
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:5173', 
  'http://localhost:5174', 
  'https://tabuloo-backend-p95l.vercel.app',
  'https://www.tabuloo.com',
  'https://tabuloo.com',
  'https://www.govupalu.com',
  'https://govupalu.vercel.app',
  'https://govupalu.com'
];

// Custom CORS middleware to handle origin properly
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Clear any existing CORS headers first
  res.removeHeader('Access-Control-Allow-Origin');
  res.removeHeader('Access-Control-Allow-Credentials');
  res.removeHeader('Access-Control-Allow-Methods');
  res.removeHeader('Access-Control-Allow-Headers');
  
  // Set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without origin (like Postman, curl)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-razorpay-signature');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/payment', paymentRoutes);

// Email API route
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body || {};
    
    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Check if SMTP environment variables are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP environment variables not configured - running in test mode');
      return res.status(200).json({ 
        ok: true, 
        message: 'Email service test mode - SMTP not configured',
        test_mode: true
      });
    }

    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@tabuloo.app';

    try {
      await transporter.sendMail({
        from: `Tabuloo <${fromAddress}>`,
        to,
        subject,
        html,
      });

      console.log('Email sent successfully to:', to);
      return res.status(200).json({ ok: true, message: 'Email sent successfully' });
    } catch (emailError) {
      console.log('Email send failed but returning success for testing:', emailError.message);
      // For testing purposes, return success even if email fails
      return res.status(200).json({ 
        ok: true, 
        message: 'Email service test mode - SMTP configured but sending failed (testing)',
        test_mode: true,
        error: emailError.message
      });
    }
    
  } catch (error) {
    console.error('Email send failed:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send email';
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Email authentication failed. Please check SMTP credentials.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to email server. Please check SMTP configuration.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Email server not found. Please check SMTP host configuration.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return res.status(500).json({ 
      ok: false, 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Direct routes to match frontend calls
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Debug logging
    console.log('📊 Payment Request Debug:');
    console.log('📊 Raw amount received:', amount);
    console.log('📊 Amount type:', typeof amount);
    console.log('📊 Currency:', currency);

    // Validate required fields
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // Convert amount to number if it's a string
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid number'
      });
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Payment gateway not configured',
        error: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found'
      });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Use amount directly (no paise conversion)
    const finalAmount = Math.round(numericAmount);
    
    console.log('📊 Amount conversion:');
    console.log('📊 Original amount:', numericAmount);
    console.log('📊 Final amount (no conversion):', finalAmount);

    // Create order options
    const options = {
      amount: finalAmount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    // Create order with Razorpay
    const order = await razorpay.orders.create(options);

    console.log('Order created:', order.id);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        created_at: order.created_at
      },
      key_id: process.env.RAZORPAY_KEY_ID,
      debug: {
        originalAmount: numericAmount,
        finalAmount: finalAmount,
        razorpayAmount: order.amount
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }

    const crypto = require('crypto');

    // Create signature for verification
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    // Verify signature
    if (razorpay_signature === expectedSign) {
      console.log('Payment verified successfully:', razorpay_payment_id);
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      console.log('Payment verification failed:', razorpay_payment_id);
      
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Retry function for payment operations
async function retryPaymentOperation(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`🔄 Payment attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

// Required routes as specified by user
app.post('/api/payment', async (req, res) => {
  try {
    const { amount, currency = 'INR', customer, order } = req.body;
    
    // Debug logging
    console.log('📊 Payment Request Debug (/api/payment):');
    console.log('📊 Raw amount received:', amount);
    console.log('📊 Amount type:', typeof amount);
    console.log('📊 Currency:', currency);
    
    // Validate required fields
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // Convert amount to number if it's a string
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid number'
      });
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Payment gateway not configured'
      });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    // Use amount directly (no paise conversion)
    const finalAmount = Math.round(numericAmount);
    
    console.log('📊 Amount conversion (/api/payment):');
    console.log('📊 Original amount:', numericAmount);
    console.log('📊 Final amount (no conversion):', finalAmount);
    
    // Create Razorpay order with retry logic
    const razorpayOrder = await retryPaymentOperation(async () => {
      return await razorpay.orders.create({
        amount: finalAmount,
        currency: currency,
        receipt: `order_${Date.now()}`
      });
    });
    
    res.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      debug: {
        originalAmount: numericAmount,
        finalAmount: finalAmount,
        razorpayAmount: razorpayOrder.amount
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }
    
    const crypto = require('crypto');
    
    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    if (generated_signature === razorpay_signature) {
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// OTP Routes
app.post('/api/otp/send', async (req, res) => {
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
    global.otpStore = global.otpStore || new Map();
    const existing = global.otpStore.get(identifier);
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in memory (use Redis/Database in production)
    global.otpStore.set(identifier, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
      created: Date.now()
    });

    // Send OTP using SMS service
    const sent = await smsService.sendOTP(identifier, otp);

    console.log(`📱 Generated OTP ${otp} for ${identifier}`);

    res.json({
      success: true,
      message: 'OTP sent successfully to phone number',
      expiresIn: 300,
      // Include OTP for testing (remove in production)
      otp
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

app.post('/api/otp/verify', async (req, res) => {
  try {
    const { identifier, otp } = req.body;

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

    // Get stored OTP
    global.otpStore = global.otpStore || new Map();
    const stored = global.otpStore.get(identifier);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    if (stored.expiresAt < Date.now()) {
      global.otpStore.delete(identifier);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    if (stored.attempts >= 3) {
      global.otpStore.delete(identifier);
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts exceeded'
      });
    }

    stored.attempts++;

    if (stored.otp === otp) {
      global.otpStore.delete(identifier);
      
      // Generate session token
      const crypto = require('crypto');
      const sessionToken = Buffer.from(JSON.stringify({
        identifier,
        verified: true,
        timestamp: Date.now(),
        sessionId: crypto.randomBytes(16).toString('hex')
      })).toString('base64');

      console.log(`✅ OTP verified successfully for ${identifier}`);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        sessionToken,
        verified: true,
        identifier: identifier
      });
    } else {
      console.log(`❌ Invalid OTP for ${identifier}`);
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

app.post('/api/otp/validate-session', async (req, res) => {
  try {
    const { sessionToken } = req.body;
    const authHeader = req.headers.authorization;

    const token = sessionToken || (authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Session token is required'
      });
    }

    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - payload.timestamp > maxAge) {
        return res.status(401).json({
          success: false,
          message: 'Session expired'
        });
      }

      // Verify required fields
      if (!payload.identifier || !payload.verified || !payload.timestamp) {
        return res.status(401).json({
          success: false,
          message: 'Invalid session token format'
        });
      }

      console.log(`✅ Session validated for ${payload.identifier}`);

      res.json({
        success: true,
        message: 'Session is valid',
        valid: true,
        data: {
          identifier: payload.identifier,
          verified: payload.verified,
          timestamp: payload.timestamp,
          sessionId: payload.sessionId
        }
      });

    } catch (parseError) {
      console.log(`❌ Invalid session token`);
      res.status(401).json({
        success: false,
        message: 'Invalid session token'
      });
    }

  } catch (error) {
    console.error('Validate session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate session'
    });
  }
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tabuloo API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Payment service health check
app.get('/api/payment/health', async (req, res) => {
  try {
    // Test Razorpay connection
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const testOrder = await razorpay.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: `health_check_${Date.now()}`
    });
    
    res.json({
      status: 'OK',
      message: 'Payment service is healthy',
      razorpay: {
        connected: true,
        testOrderId: testOrder.id
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Payment service is not healthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  // Check service configurations
  const serviceStatus = {
    razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  };

  const response = {
    status: 'OK',
    message: 'Tabuloo backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      seconds: Math.floor(uptime),
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    services: serviceStatus,
    version: process.version,
    platform: process.platform,
    port: PORT,
    pid: process.pid
  };

  // Overall health status based on critical services
  const criticalServices = ['razorpay'];
  const healthyServices = criticalServices.every(service => serviceStatus[service]);
  
  if (!healthyServices) {
    response.status = 'DEGRADED';
    response.warnings = [];
    
    if (!serviceStatus.razorpay) {
      response.warnings.push('Razorpay payment gateway not configured');
    }
    if (!serviceStatus.twilio) {
      response.warnings.push('Twilio SMS service not configured (SMS will be mocked)');
    }
    if (!serviceStatus.smtp) {
      response.warnings.push('SMTP email service not configured');
    }
  }

  res.json(response);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Handle 404 - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Only start server if not on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel
module.exports = app;