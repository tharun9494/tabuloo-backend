const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test OTP sending
async function testSendOTP() {
  try {
    console.log('🔍 Testing OTP sending...');
    
    const response = await axios.post(`${BASE_URL}/api/otp/send`, {
      identifier: 'Twilio_Verified_Num'
    });
    
    console.log('✅ OTP send response:', response.data);
    
    // Return the test phone number and OTP for verification test
    return {
      identifier: 'Twilio_Verified_Num',
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
    console.log('🔍 Testing OTP verification...');
    
    const response = await axios.post(`${BASE_URL}/api/otp/verify`, {
      identifier: identifier,
      otp: otp
    });
    
    console.log('✅ OTP verification response:', response.data);
    
    return response.data.sessionToken;
    
  } catch (error) {
    console.error('❌ OTP verification failed:', error.response?.data || error.message);
    return null;
  }
}

// Test session validation with body
async function testValidateSession(sessionToken) {
  try {
    console.log('🔍 Testing session validation...');
    
    const response = await axios.post(`${BASE_URL}/api/otp/validate-session`, {
      sessionToken: sessionToken
    });
    
    console.log('✅ Session validation response:', response.data);
    
  } catch (error) {
    console.error('❌ Session validation failed:', error.response?.data || error.message);
  }
}

// Test session validation with Authorization header
async function testValidateSessionWithHeader(sessionToken) {
  try {
    console.log('🔍 Testing session validation with Authorization header...');
    
    const response = await axios.post(`${BASE_URL}/api/otp/validate-session`, {}, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
    
    console.log('✅ Session validation with header response:', response.data);
    
  } catch (error) {
    console.error('❌ Session validation with header failed:', error.response?.data || error.message);
  }
}

// Test invalid OTP
async function testInvalidOTP() {
  try {
    console.log('🔍 Testing invalid OTP...');
    
    const response = await axios.post(`${BASE_URL}/api/otp/verify`, {
      identifier: 'Twilio_Verified_Num',
      otp: '000000' // Invalid OTP
    });
    
    console.log('❌ This should not succeed:', response.data);
    
  } catch (error) {
    console.log('✅ Invalid OTP correctly rejected:', error.response?.data?.message);
  }
}

// Test expired session
async function testExpiredSession() {
  try {
    console.log('🔍 Testing expired session...');
    
    // Create a fake expired token
    const expiredPayload = {
      identifier: '+919876543210',
      verified: true,
      timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
    };
    const expiredToken = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
    
    const response = await axios.post(`${BASE_URL}/api/otp/validate-session`, {
      sessionToken: expiredToken
    });
    
    console.log('❌ This should not succeed:', response.data);
    
  } catch (error) {
    console.log('✅ Expired session correctly rejected:', error.response?.data?.message);
  }
}

// Test rate limiting
async function testRateLimiting() {
  try {
    console.log('🔍 Testing rate limiting...');
    
    // Send first OTP
    await axios.post(`${BASE_URL}/api/otp/send`, {
      identifier: 'Twilio_Verified_Num'
    });
    
    // Try to send another OTP immediately
    const response = await axios.post(`${BASE_URL}/api/otp/send`, {
      identifier: 'Twilio_Verified_Num'
    });
    
    console.log('❌ This should be rate limited:', response.data);
    
  } catch (error) {
    console.log('✅ Rate limiting working:', error.response?.data?.message);
  }
}

// Test complete OTP flow
async function testCompleteOTPFlow() {
  console.log('\n🚀 Testing complete OTP flow...\n');
  
  // 1. Send OTP
  const otpData = await testSendOTP();
  console.log('');
  
  if (otpData) {
    // 2. Verify OTP
    const sessionToken = await testVerifyOTP(otpData.identifier, otpData.otp);
    console.log('');
    
    if (sessionToken) {
      // 3. Validate session (body)
      await testValidateSession(sessionToken);
      console.log('');
      
      // 4. Validate session (header)
      await testValidateSessionWithHeader(sessionToken);
      console.log('');
    }
  }
}

// Test error cases
async function testErrorCases() {
  console.log('\n🔍 Testing error cases...\n');
  
  // Test invalid OTP
  await testInvalidOTP();
  console.log('');
  
  // Test expired session
  await testExpiredSession();
  console.log('');
  
  // Test rate limiting
  await testRateLimiting();
  console.log('');
}

// Run all OTP tests
async function runOTPTests() {
  console.log('🚀 Starting comprehensive OTP tests...\n');
  
  // Test complete flow
  await testCompleteOTPFlow();
  
  // Test error cases
  await testErrorCases();
  
  console.log('\n✨ All OTP tests completed!');
  console.log('\n📝 Available API Endpoints:');
  console.log('1. POST /api/otp/send - Send OTP to phone');
  console.log('2. POST /api/otp/verify - Verify OTP and get session token');
  console.log('3. POST /api/otp/validate-session - Validate session token');
  console.log('\n📱 Usage Examples:');
  console.log('- Send OTP: { "identifier": "+919876543210" }');
  console.log('- Verify OTP: { "identifier": "+919876543210", "otp": "123456" }');
  console.log('- Validate Session: { "sessionToken": "base64_token" }');
  console.log('- Or use Authorization header: "Bearer base64_token"');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runOTPTests().catch(console.error);
}

module.exports = {
  testSendOTP,
  testVerifyOTP,
  testValidateSession,
  testValidateSessionWithHeader,
  testInvalidOTP,
  testExpiredSession,
  testRateLimiting,
  runOTPTests
};
