const axios = require('axios');

const BASE_URL = 'https://tabuloo-backend-p95l.vercel.app';

// Test production payment creation
async function testProductionPayment() {
  try {
    console.log('Testing production payment creation...');
    
    const response = await axios.post(`${BASE_URL}/api/payment`, {
      amount: 1000, // ₹10
      currency: 'INR',
      customer: 'production-test-customer',
      order: 'production-test-order-123'
    });
    
    console.log('✅ Production payment creation successful:', response.data);
    
    // Check if it's using production keys (key ID should not start with 'rzp_test_')
    if (response.data.key_id && !response.data.key_id.startsWith('rzp_test_')) {
      console.log('✅ Using production Razorpay keys');
    } else {
      console.log('⚠️  Still using test keys - please update environment variables');
    }
    
    return response.data.order_id;
  } catch (error) {
    console.error('❌ Production payment creation failed:', error.response?.data || error.message);
    return null;
  }
}

// Test production payment verification
async function testProductionVerification(orderId) {
  try {
    console.log('Testing production payment verification...');
    
    // Note: This is a mock verification since we don't have real payment data
    const mockData = {
      razorpay_payment_id: 'pay_prod_mock123',
      razorpay_order_id: orderId || 'order_prod_mock123',
      razorpay_signature: 'mock_signature'
    };
    
    const response = await axios.post(`${BASE_URL}/api/payment/verify`, mockData);
    
    console.log('✅ Production payment verification response:', response.data);
  } catch (error) {
    console.error('❌ Production payment verification failed:', error.response?.data || error.message);
  }
}

// Check environment variables
async function checkEnvironment() {
  try {
    console.log('Checking environment configuration...');
    
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    console.log('✅ Health check successful:', response.data);
    
    // Test a small order to check key configuration
    const testResponse = await axios.post(`${BASE_URL}/api/payment`, {
      amount: 100, // ₹1
      currency: 'INR'
    });
    
    if (testResponse.data.key_id) {
      if (testResponse.data.key_id.startsWith('rzp_live_')) {
        console.log('✅ Production mode detected');
      } else if (testResponse.data.key_id.startsWith('rzp_test_')) {
        console.log('⚠️  Test mode detected - please switch to production keys');
      } else {
        console.log('❓ Unknown key format');
      }
    }
    
  } catch (error) {
    console.error('❌ Environment check failed:', error.response?.data || error.message);
  }
}

// Run production tests
async function runProductionTests() {
  console.log('🚀 Starting production mode tests...\n');
  
  await checkEnvironment();
  console.log('');
  
  const orderId = await testProductionPayment();
  console.log('');
  
  if (orderId) {
    await testProductionVerification(orderId);
  }
  
  console.log('\n✨ Production tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Update Vercel environment variables with production keys');
  console.log('2. Update frontend to use production key ID');
  console.log('3. Test with real payments');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runProductionTests().catch(console.error);
}

module.exports = {
  testProductionPayment,
  testProductionVerification,
  checkEnvironment,
  runProductionTests
}; 