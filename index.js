const dotenv = require('dotenv');

// Load environment variables FIRST before requiring any other modules
dotenv.config();

// This file is for local development only
// For Vercel deployment, use the API routes in the api/ folder

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Routes
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
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

// Only start server if not on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel
module.exports = app;