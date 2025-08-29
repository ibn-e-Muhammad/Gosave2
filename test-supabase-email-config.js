// Test Supabase email configuration after SMTP setup
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testSupabaseEmailConfig() {
  console.log('📧 Testing Supabase Email Configuration\n');
  console.log('=' .repeat(60));

  // Generate unique email for testing
  const timestamp = Date.now();
  const testEmail = `emailtest${timestamp}@gmail.com`; // Use a real email you can check
  
  console.log(`🧪 Testing with email: ${testEmail}`);
  console.log('⚠️  IMPORTANT: Use a real email address you can check!');

  try {
    // Step 1: Test registration with real email
    console.log('\n1️⃣  Testing Registration with Real Email...');
    const registrationData = {
      email: testEmail,
      password: 'TestPass123',
      full_name: 'Email Test User'
    };

    const registerResponse = await axios.post(`${API_URL}/api/v1/auth/register`, registrationData);
    
    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      console.log('📧 Email verification required:', registerResponse.data.data.email_verification_required);
      
      console.log('\n📬 EMAIL DELIVERY TEST:');
      console.log('1. Check your email inbox (and spam folder)');
      console.log('2. Look for email from "GoSave Team"');
      console.log('3. Email should arrive within 1-2 minutes');
      console.log('4. If no email arrives, SMTP configuration needs fixing');
      
      // Step 2: Test resend verification
      console.log('\n2️⃣  Testing Resend Verification...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      try {
        const resendResponse = await axios.post(`${API_URL}/api/v1/auth/resend-verification`, {
          email: testEmail
        });
        
        if (resendResponse.data.success) {
          console.log('✅ Resend verification successful');
          console.log('📧 Check for second verification email');
        } else {
          console.log('❌ Resend verification failed:', resendResponse.data.error);
        }
      } catch (error) {
        console.log('❌ Resend verification error:', error.response?.data?.error || error.message);
      }

      // Step 3: Provide manual verification option
      console.log('\n3️⃣  Manual Verification Option...');
      console.log('If emails are not arriving, you can manually verify:');
      console.log(`🔧 Go to: http://localhost:5173/admin/verify`);
      console.log(`📧 Enter email: ${testEmail}`);
      console.log('🔘 Click "Verify User"');

    } else {
      console.log('❌ Registration failed:', registerResponse.data.error);
    }

  } catch (error) {
    console.log('❌ Registration error:', error.response?.data?.error || error.message);
  }

  // Step 4: Configuration checklist
  console.log('\n' + '=' .repeat(60));
  console.log('📋 SMTP CONFIGURATION CHECKLIST');
  console.log('=' .repeat(60));
  
  console.log('\n✅ Required Gmail SMTP Settings:');
  console.log('• Host: smtp.gmail.com');
  console.log('• Port: 587');
  console.log('• Username: muhammadarslan23156@gmail.com');
  console.log('• Password: [16-character App Password]');
  console.log('• Sender: muhammadarslan23156@gmail.com');
  
  console.log('\n🔧 If emails still not arriving:');
  console.log('1. Verify Gmail App Password is correct');
  console.log('2. Check Gmail 2FA is enabled');
  console.log('3. Verify "Enable email confirmations" is checked');
  console.log('4. Check Supabase project logs for errors');
  console.log('5. Try alternative SMTP provider (SendGrid)');
  
  console.log('\n📊 Expected Timeline:');
  console.log('• Email should arrive within 1-2 minutes');
  console.log('• Check both inbox and spam folder');
  console.log('• If no email after 5 minutes, configuration issue exists');
}

// Helper function to test with your actual email
async function testWithRealEmail(realEmail) {
  console.log(`\n🎯 Testing with your real email: ${realEmail}`);
  
  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/resend-verification`, {
      email: realEmail
    });
    
    if (response.data.success) {
      console.log('✅ Verification email sent to your real email');
      console.log('📧 Check your inbox and spam folder');
    } else {
      console.log('❌ Failed to send to real email:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Error sending to real email:', error.response?.data?.error || error.message);
  }
}

// Run the test
testSupabaseEmailConfig().catch(console.error);

// Export helper for manual testing
module.exports = { testWithRealEmail };
