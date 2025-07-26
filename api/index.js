import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import paymentRoutes from '../../routes/payment.js';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174', 
    'https://forefight-health-backend-tharun9494s-projects.vercel.app',
    'https://forefight-patient.vercel.app',
    'https://www.govupalu.com',
    'https://govupalu.vercel.app',
    'https://govupalu.com',
    'https://forefight-health-backend.vercel.app/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/payment', paymentRoutes);

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

// Vercel serverless function handler
export default function handler(req, res) {
  return app(req, res);
} 