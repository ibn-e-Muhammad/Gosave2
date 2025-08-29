// Test email verification system specifically
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testEmailVerification() {
  console.log('📧 Testing Email Verification System\n');
  console.log('=' .repeat(50));

  // Generate unique email for testing
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  
  console.log(`\n🧪 Testing with email: ${testEmail}`);

  try {
    // Test registration with unique email
    console.log('\n1️⃣  Testing Registration...');
    const registrationData = {
      email: testEmail,
      password: 'TestPass123',
      full_name: 'Test User',
      phone: '+1234567890'
    };

    const registerResponse = await axios.post(`${API_URL}/api/v1/auth/register`, registrationData);
    
    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      console.log(`📧 Email verification required: ${registerResponse.data.data.email_verification_required}`);
      console.log(`📝 Message: ${registerResponse.data.message}`);
      
      // Test 2: Try to login with unverified email
      console.log('\n2️⃣  Testing Login with Unverified Email...');
      try {
        const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
          email: testEmail,
          password: 'TestPass123'
        });
        
        if (loginResponse.data.success) {
          console.log('❌ Login succeeded with unverified email (should fail)');
        } else {
          console.log('✅ Login correctly blocked for unverified email');
          console.log(`📧 Error: ${loginResponse.data.error}`);
        }
      } catch (error) {
        if (error.response?.data?.email_verification_required) {
          console.log('✅ Login correctly blocked for unverified email');
          console.log(`📧 Error: ${error.response.data.error}`);
        } else {
          console.log(`✅ Login blocked: ${error.response?.data?.error || error.message}`);
        }
      }

      // Test 3: Test resend verification
      console.log('\n3️⃣  Testing Resend Verification...');
      try {
        const resendResponse = await axios.post(`${API_URL}/api/v1/auth/resend-verification`, {
          email: testEmail
        });
        
        if (resendResponse.data.success) {
          console.log('✅ Resend verification successful');
          console.log(`📝 Message: ${resendResponse.data.message}`);
        } else {
          console.log('❌ Resend verification failed:', resendResponse.data.error);
        }
      } catch (error) {
        console.log('❌ Resend verification error:', error.response?.data?.error || error.message);
      }

    } else {
      console.log('❌ Registration failed:', registerResponse.data.error);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Registration failed:', error.response.status, error.response.data.error);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📧 Email Verification Test Complete');
  console.log('\n📝 Key Points to Check:');
  console.log('1. Check backend server logs for email sending errors');
  console.log('2. Verify Supabase email configuration in dashboard');
  console.log('3. Check if SMTP settings are configured');
  console.log('4. Verify email templates are set up');
  console.log('5. Check spam folder for verification emails');
}

testEmailVerification().catch(console.error);
