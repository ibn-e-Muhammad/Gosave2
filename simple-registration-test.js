// Simple registration test to see verification links
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testSingleRegistration() {
  console.log('🧪 Testing Single Registration for Email Verification\n');

  // Generate unique email
  const timestamp = Date.now();
  const testEmail = `verify${timestamp}@example.com`;
  
  console.log(`📧 Testing with email: ${testEmail}`);

  try {
    const registrationData = {
      email: testEmail,
      password: 'TestPass123',
      full_name: 'Verification Test User'
    };

    console.log('\n📤 Sending registration request...');
    const response = await axios.post(`${API_URL}/api/v1/auth/register`, registrationData);
    
    if (response.data.success) {
      console.log('✅ Registration successful!');
      console.log('📧 Check backend server console for verification link');
      console.log('🔗 Look for: "📧 Email verification link: https://..."');
    } else {
      console.log('❌ Registration failed:', response.data.error);
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data?.error || error.message);
  }
}

testSingleRegistration();
