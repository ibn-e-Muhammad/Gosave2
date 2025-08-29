// Test email delivery to your actual Gmail account
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testRealEmailDelivery() {
  console.log('📧 Testing Email Delivery to Your Gmail Account\n');
  console.log('=' .repeat(60));

  // Use your actual Gmail address for testing
  const yourEmail = 'muhammadarslan23156@gmail.com';
  
  console.log(`🎯 Testing email delivery to: ${yourEmail}`);
  console.log('📧 This will test if SMTP is working correctly');

  try {
    // Step 1: Register with your actual email
    console.log('\n1️⃣  Registering with your Gmail address...');
    const registrationData = {
      email: yourEmail,
      password: 'TestPass123',
      full_name: 'Arslan Test User'
    };

    try {
      const registerResponse = await axios.post(`${API_URL}/api/v1/auth/register`, registrationData);
      
      if (registerResponse.data.success) {
        console.log('✅ Registration successful');
        console.log('📧 Email verification required:', registerResponse.data.data.email_verification_required);
      } else {
        console.log('⚠️  Registration response:', registerResponse.data.error);
        if (registerResponse.data.error.includes('already exists')) {
          console.log('👤 User already exists, testing resend verification...');
        }
      }
    } catch (regError) {
      if (regError.response?.data?.error?.includes('already exists')) {
        console.log('👤 User already exists, that\'s fine - testing resend verification...');
      } else {
        console.log('❌ Registration error:', regError.response?.data?.error || regError.message);
        return;
      }
    }

    // Step 2: Test resend verification to your email
    console.log('\n2️⃣  Sending verification email to your Gmail...');
    
    try {
      const resendResponse = await axios.post(`${API_URL}/api/v1/auth/resend-verification`, {
        email: yourEmail
      });
      
      if (resendResponse.data.success) {
        console.log('✅ Verification email sent successfully');
        console.log('📝 Message:', resendResponse.data.message);
        
        console.log('\n📬 EMAIL DELIVERY CHECK:');
        console.log('🔍 Check your Gmail inbox: muhammadarslan23156@gmail.com');
        console.log('📁 Also check your SPAM/JUNK folder');
        console.log('⏰ Email should arrive within 1-2 minutes');
        console.log('📧 Look for email from "GoSave Team"');
        console.log('📋 Subject: "Confirm your signup"');
        
        console.log('\n⏱️  Waiting 30 seconds for email delivery...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        console.log('\n❓ Did you receive the email?');
        console.log('✅ YES: SMTP configuration is working correctly!');
        console.log('❌ NO: SMTP configuration needs to be fixed');
        
      } else {
        console.log('❌ Failed to send verification email:', resendResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Resend verification error:', error.response?.data?.error || error.message);
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  // Step 3: Provide troubleshooting steps
  console.log('\n' + '=' .repeat(60));
  console.log('🔧 TROUBLESHOOTING STEPS');
  console.log('=' .repeat(60));
  
  console.log('\n📧 If NO email was received:');
  console.log('1. ❌ SMTP Host is wrong (should be smtp.gmail.com)');
  console.log('2. ❌ Gmail App Password is incorrect');
  console.log('3. ❌ "Enable email confirmations" is unchecked');
  console.log('4. ❌ Email template is disabled');
  console.log('5. ❌ Gmail 2FA is not enabled');
  
  console.log('\n✅ If email WAS received:');
  console.log('1. ✅ SMTP configuration is working!');
  console.log('2. ✅ Email delivery is functional');
  console.log('3. ✅ Users will receive verification emails');
  console.log('4. ✅ Registration system is complete');
  
  console.log('\n🔧 Next Steps:');
  console.log('• If email received: System is working perfectly!');
  console.log('• If no email: Fix SMTP settings in Supabase Dashboard');
  console.log('• Use manual verification for development: http://localhost:5173/admin/verify');
  
  console.log('\n📋 Required Gmail SMTP Settings:');
  console.log('• Host: smtp.gmail.com');
  console.log('• Port: 587');
  console.log('• Username: muhammadarslan23156@gmail.com');
  console.log('• Password: [16-character Gmail App Password]');
  console.log('• Sender: muhammadarslan23156@gmail.com');
}

// Run the test
testRealEmailDelivery().catch(console.error);
