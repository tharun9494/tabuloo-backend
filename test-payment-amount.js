// Test script to verify payment amount conversion
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testPaymentAmount() {
  console.log('🧪 Testing Payment Amount Conversion\n');
  
  try {
    // Test with amount 70
    console.log('📊 Testing with amount: 70');
    const response = await axios.post(`${BASE_URL}/api/create-order`, {
      amount: 70,
      currency: 'INR'
    });
    
    console.log('✅ Response received:');
    console.log('📊 Original amount:', response.data.debug.originalAmount);
    console.log('📊 Final amount:', response.data.debug.finalAmount);
    console.log('📊 Razorpay amount:', response.data.debug.razorpayAmount);
    console.log('📊 Expected amount: 70');
    console.log('📊 Match:', response.data.debug.finalAmount === 70 ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPaymentAmount();
