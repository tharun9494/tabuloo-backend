const axios = require('axios');

const BASE_URL = 'https://tabuloo-backend-p95l.vercel.app';

async function testProductionFix() {
  try {
    console.log('🔍 Testing production mode fix...');
    
    // Test the payment endpoint
    const response = await axios.post(`${BASE_URL}/api/payment`, {
      amount: 100,
      currency: 'INR',
      customer: 'test-customer',
      order: 'test-order'
    });
    
    console.log('✅ Response received:', response.data);
    
    if (response.data.key_id) {
      if (response.data.key_id.startsWith('rzp_live_')) {
        console.log('✅ SUCCESS: Backend is using PRODUCTION keys');
        console.log('Key ID:', response.data.key_id);
      } else if (response.data.key_id.startsWith('rzp_test_')) {
        console.log('❌ Backend is still using TEST keys');
        console.log('Key ID:', response.data.key_id);
        console.log('\n🔧 Fix: Update Vercel environment variables');
      } else {
        console.log('❓ Unknown key format:', response.data.key_id);
      }
    } else {
      console.log('❌ No key_id in response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n🔧 Fix: Deploy your changes to Vercel');
      console.log('1. Commit your changes');
      console.log('2. Push to your repository');
      console.log('3. Vercel will auto-deploy');
    }
  }
}

// Run test
testProductionFix().catch(console.error); 