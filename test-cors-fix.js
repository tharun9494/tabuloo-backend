// Test CORS fix
const axios = require('axios');

const BASE_URL = 'https://tabuloo-backend-p95l.vercel.app';

async function testCorsFix() {
  console.log('🧪 Testing CORS Fix\n');
  
  try {
    // Test OPTIONS preflight request
    console.log('📊 Testing OPTIONS preflight request...');
    const optionsResponse = await axios.options(`${BASE_URL}/api/payment`, {
      headers: {
        'Origin': 'https://www.tabuloo.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ OPTIONS response status:', optionsResponse.status);
    console.log('📊 CORS headers:');
    console.log('   Access-Control-Allow-Origin:', optionsResponse.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Methods:', optionsResponse.headers['access-control-allow-methods']);
    console.log('   Access-Control-Allow-Headers:', optionsResponse.headers['access-control-allow-headers']);
    
    // Test actual POST request
    console.log('\n📊 Testing POST request...');
    const postResponse = await axios.post(`${BASE_URL}/api/payment`, {
      amount: 70,
      currency: 'INR'
    }, {
      headers: {
        'Origin': 'https://www.tabuloo.com',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST response status:', postResponse.status);
    console.log('📊 Response data:', postResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.headers) {
      console.log('📊 Response headers:', error.response.headers);
    }
  }
}

// Run the test
testCorsFix();