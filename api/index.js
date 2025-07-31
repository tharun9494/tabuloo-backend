const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Delay utility function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174', 
    'https://tabuloo-backend-p95l.vercel.app/',
    'https://www.tabuloo.com',
    'https://tabuloo.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test delay endpoint
app.get('/api/delay-test', async (req, res) => {
  const delayMs = parseInt(req.query.ms) || 2000; // Default 2 seconds
  
  console.log(`Starting delay of ${delayMs}ms...`);
  
  try {
    await delay(delayMs);
    
    res.json({
      success: true,
      message: `Delay completed after ${delayMs}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Delay failed',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Razorpay backend is running' });
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

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app; 