const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test the payment creation route
async function testCreatePayment() {
  try {
    console.log('Testing POST /api/payment...');
    
    const response = await axios.post(`${BASE_URL}/api/payment`, {
      amount: 1000, // ₹10
      currency: 'INR',
      customer: 'test-customer',
      order: 'test-order-123'
    });
    
    console.log('✅ Payment creation successful:', response.data);
    return response.data.order_id;
  } catch (error) {
    console.error('❌ Payment creation failed:', error.response?.data || error.message);
    return null;
  }
}

// Test the payment verification route
async function testVerifyPayment(orderId) {
  try {
    console.log('Testing POST /api/payment/verify...');
    
    // Note: This is a mock verification since we don't have real payment data
    // In a real scenario, you would get these values from the frontend after payment
    const mockData = {
      razorpay_payment_id: 'pay_mock123',
      razorpay_order_id: orderId || 'order_mock123',
      razorpay_signature: 'mock_signature'
    };
    
    const response = await axios.post(`${BASE_URL}/api/payment/verify`, mockData);
    
    console.log('✅ Payment verification response:', response.data);
  } catch (error) {
    console.error('❌ Payment verification failed:', error.response?.data || error.message);
  }
}

// Test health check
async function testHealthCheck() {
  try {
    console.log('Testing GET /health...');
    
    const response = await axios.get(`${BASE_URL}/health`);
    
    console.log('✅ Health check successful:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting route tests...\n');
  
  await testHealthCheck();
  console.log('');
  
  const orderId = await testCreatePayment();
  console.log('');
  
  if (orderId) {
    await testVerifyPayment(orderId);
  }
  
  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCreatePayment,
  testVerifyPayment,
  testHealthCheck,
  runTests
}; 