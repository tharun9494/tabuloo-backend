const axios = require('axios');

const BASE_URL = 'https://tabuloo-backend-p95l.vercel.app';

// Test CORS preflight request
async function testCORS() {
  try {
    console.log('Testing CORS preflight request...');
    
    // Test OPTIONS request (preflight)
    const optionsResponse = await axios.options(`${BASE_URL}/api/payment`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ CORS preflight successful');
    console.log('Response headers:', optionsResponse.headers);
    
    // Test actual POST request
    console.log('\nTesting POST request...');
    const postResponse = await axios.post(`${BASE_URL}/api/payment`, {
      amount: 1000,
      currency: 'INR',
      customer: 'test-customer',
      order: 'test-order-123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });
    
    console.log('✅ POST request successful:', postResponse.data);
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.response?.data || error.message);
    if (error.response?.headers) {
      console.log('Response headers:', error.response.headers);
    }
  }
}

// Test health endpoint
async function testHealth() {
  try {
    console.log('\nTesting health endpoint...');
    
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    console.log('✅ Health check successful:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runCORSTests() {
  console.log('🚀 Starting CORS tests...\n');
  
  await testHealth();
  await testCORS();
  
  console.log('\n✨ CORS tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCORSTests().catch(console.error);
}

module.exports = {
  testCORS,
  testHealth,
  runCORSTests
}; 