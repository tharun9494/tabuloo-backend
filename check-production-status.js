const axios = require('axios');

const BASE_URL = 'https://tabuloo-backend-p95l.vercel.app';

// Check backend production status
async function checkBackendStatus() {
  try {
    console.log('🔍 Checking backend production status...');
    
    const response = await axios.post(`${BASE_URL}/api/payment`, {
      amount: 100,
      currency: 'INR',
      customer: 'status-check',
      order: 'status-check-order'
    });
    
    console.log('Backend Response:', response.data);
    
    if (response.data.key_id) {
      if (response.data.key_id.startsWith('rzp_live_')) {
        console.log('✅ Backend is using PRODUCTION keys');
        return 'production';
      } else if (response.data.key_id.startsWith('rzp_test_')) {
        console.log('❌ Backend is still using TEST keys');
        return 'test';
      } else {
        console.log('❓ Unknown key format:', response.data.key_id);
        return 'unknown';
      }
    } else {
      console.log('❌ No key_id in response');
      return 'no-key';
    }
    
  } catch (error) {
    console.error('❌ Backend check failed:', error.response?.data || error.message);
    return 'error';
  }
}

// Check if frontend is using correct keys
function checkFrontendKeys() {
  console.log('\n🔍 Frontend Key Check Instructions:');
  console.log('1. Open your frontend code');
  console.log('2. Look for Razorpay initialization like this:');
  console.log('   const razorpay = new Razorpay({');
  console.log('     key: "rzp_test_..." // ← This should be rzp_live_...');
  console.log('   });');
  console.log('');
  console.log('3. Common places to check:');
  console.log('   - paymentService.ts');
  console.log('   - PaymentService class');
  console.log('   - Razorpay initialization');
  console.log('   - Environment variables in frontend');
  console.log('');
  console.log('4. Make sure you\'re using the production key ID from your Razorpay dashboard');
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\n🔍 Environment Variables Check:');
  console.log('1. Go to your Vercel dashboard');
  console.log('2. Check if these variables are set correctly:');
  console.log('   RAZORPAY_KEY_ID = rzp_live_... (not rzp_test_...)');
  console.log('   RAZORPAY_KEY_SECRET = [your production secret]');
  console.log('');
  console.log('3. If they\'re still test keys, update them with production keys');
}

// Generate frontend code example
function generateFrontendExample() {
  console.log('\n📝 Correct Frontend Code Example:');
  console.log(`
// ✅ CORRECT - Production Mode
const razorpay = new Razorpay({
  key: 'rzp_live_YOUR_PRODUCTION_KEY_ID', // ← Production key
  currency: 'INR',
  amount: amount * 100,
  name: 'Your Company Name',
  description: 'Payment for your order',
  order_id: orderId,
  handler: function(response) {
    // Handle success
  },
  prefill: {
    name: customerName,
    email: customerEmail,
    contact: customerPhone
  },
  theme: {
    color: '#3399cc'
  }
});

// ❌ WRONG - Test Mode
const razorpay = new Razorpay({
  key: 'rzp_test_YOUR_TEST_KEY_ID', // ← Test key
  // ... rest of config
});
`);
}

// Run comprehensive check
async function runComprehensiveCheck() {
  console.log('🚀 Running comprehensive production mode check...\n');
  
  const backendStatus = await checkBackendStatus();
  
  if (backendStatus === 'production') {
    console.log('\n✅ Backend is correctly configured for production!');
    console.log('The issue is likely in your frontend code.');
  } else if (backendStatus === 'test') {
    console.log('\n❌ Backend is still using test keys.');
    console.log('You need to update your Vercel environment variables.');
  }
  
  checkFrontendKeys();
  checkEnvironmentVariables();
  generateFrontendExample();
  
  console.log('\n🔧 Quick Fix Steps:');
  console.log('1. Update Vercel environment variables with production keys');
  console.log('2. Update frontend to use production key ID');
  console.log('3. Deploy changes');
  console.log('4. Test with a small amount');
  
  console.log('\n✨ Check completed!');
}

// Run check if this file is executed directly
if (require.main === module) {
  runComprehensiveCheck().catch(console.error);
}

module.exports = {
  checkBackendStatus,
  checkFrontendKeys,
  checkEnvironmentVariables,
  generateFrontendExample,
  runComprehensiveCheck
}; 