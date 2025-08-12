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

// Test OTP sending
async function testSendOTP() {
  try {
    console.log('Testing POST /api/otp/send...');
    
    const response = await axios.post(`${BASE_URL}/api/otp/send`, {
      identifier: '+918309547073'
    });
    
    console.log('✅ OTP send successful:', response.data);
    return {
      identifier: '+918309547073',
      otp: response.data.otp // OTP is returned for testing
    };
  } catch (error) {
    console.error('❌ OTP send failed:', error.response?.data || error.message);
    return null;
  }
}

// Test OTP verification
async function testVerifyOTP(identifier, otp) {
  try {
    console.log('Testing POST /api/otp/verify...');
    
    const response = await axios.post(`${BASE_URL}/api/otp/verify`, {
      identifier: identifier,
      otp: otp
    });
    
    console.log('✅ OTP verification successful:', response.data);
    return response.data.sessionToken;
  } catch (error) {
    console.error('❌ OTP verification failed:', error.response?.data || error.message);
    return null;
  }
}

// Test session validation
async function testValidateSession(sessionToken) {
  try {
    console.log('Testing POST /api/otp/validate-session...');
    
    const response = await axios.post(`${BASE_URL}/api/otp/validate-session`, {
      sessionToken: sessionToken
    });
    
    console.log('✅ Session validation successful:', response.data);
  } catch (error) {
    console.error('❌ Session validation failed:', error.response?.data || error.message);
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
  console.log('🚀 Starting comprehensive API tests...\n');
  
  // Health Check
  await testHealthCheck();
  console.log('');
  
  // Payment Tests
  const orderId = await testCreatePayment();
  console.log('');
  
  if (orderId) {
    await testVerifyPayment(orderId);
    console.log('');
  }
  
  // OTP Tests
  const otpData = await testSendOTP();
  console.log('');
  
  if (otpData) {
    const sessionToken = await testVerifyOTP(otpData.identifier, otpData.otp);
    console.log('');
    
    if (sessionToken) {
      await testValidateSession(sessionToken);
    }
  }
  
  console.log('\n✨ All tests completed!');
  console.log('\n📝 Available API Endpoints:');
  console.log('Payment APIs:');
  console.log('• POST /api/payment - Create payment order');
  console.log('• POST /api/payment/verify - Verify payment');
  console.log('\nOTP APIs:');
  console.log('• POST /api/otp/send - Send OTP to phone');
  console.log('• POST /api/otp/verify - Verify OTP');
  console.log('• POST /api/otp/validate-session - Validate session');
  console.log('\nHealth Check:');
  console.log('• GET /health - Server health status');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCreatePayment,
  testVerifyPayment,
  testSendOTP,
  testVerifyOTP,
  testValidateSession,
  testHealthCheck,
  runTests
};
