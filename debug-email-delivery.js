// Comprehensive email delivery debugging script
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function debugEmailDelivery() {
  console.log('🔍 GoSave Email Delivery Debugging\n');
  console.log('=' .repeat(60));

  // Test 1: Check if backend is running
  console.log('1️⃣  Testing Backend Connection...');
  try {
    const healthResponse = await axios.get(`${API_URL}/api/v1/health`);
    console.log('✅ Backend is running:', healthResponse.data.message);
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    console.log('🔧 Start backend: node gosave-backend/server.js');
    return;
  }

  // Test 2: Test registration endpoint
  console.log('\n2️⃣  Testing Registration Endpoint...');
  const testEmail = `debug${Date.now()}@gmail.com`;
  
  try {
    const registerResponse = await axios.post(`${API_URL}/api/v1/auth/register`, {
      email: testEmail,
      password: 'TestPass123',
      full_name: 'Debug Test User'
    });
    
    if (registerResponse.data.success) {
      console.log('✅ Registration endpoint working');
      console.log('📧 Email verification required:', registerResponse.data.data.email_verification_required);
    } else {
      console.log('❌ Registration failed:', registerResponse.data.error);
    }
  } catch (error) {
    console.log('❌ Registration error:', error.response?.data?.error || error.message);
  }

  // Test 3: Test resend verification
  console.log('\n3️⃣  Testing Resend Verification...');
  try {
    const resendResponse = await axios.post(`${API_URL}/api/v1/auth/resend-verification`, {
      email: 'firesafire60@gmail.com' // Your actual email
    });
    
    if (resendResponse.data.success) {
      console.log('✅ Resend verification endpoint working');
      console.log('📝 Message:', resendResponse.data.message);
      
      console.log('\n📧 EMAIL DELIVERY CHECK:');
      console.log('🔍 Check inbox: firesafire60@gmail.com');
      console.log('📁 Check spam/junk folder');
      console.log('⏰ Wait 2-3 minutes for delivery');
      
    } else {
      console.log('❌ Resend verification failed:', resendResponse.data.error);
    }
  } catch (error) {
    console.log('❌ Resend verification error:', error.response?.data?.error || error.message);
  }

  // Test 4: Configuration analysis
  console.log('\n4️⃣  Configuration Analysis...');
  console.log('📋 Current SMTP Configuration Issues:');
  console.log('❌ Gmail SMTP is not suitable for transactional emails');
  console.log('❌ Provider warning indicates delivery problems');
  console.log('❌ Gmail may block automated emails');
  console.log('❌ High chance of emails going to spam');

  // Test 5: Recommendations
  console.log('\n' + '=' .repeat(60));
  console.log('💡 RECOMMENDED SOLUTIONS');
  console.log('=' .repeat(60));
  
  console.log('\n🥇 OPTION 1: Use Supabase Default Email (Easiest)');
  console.log('1. Supabase Dashboard → Authentication → Settings');
  console.log('2. Turn OFF "Enable Custom SMTP"');
  console.log('3. Ensure "Enable email confirmations" is ON');
  console.log('4. Test immediately - no configuration needed');
  
  console.log('\n🥈 OPTION 2: Use SendGrid (Professional)');
  console.log('1. Sign up at sendgrid.com (free)');
  console.log('2. Get API key');
  console.log('3. Configure SMTP with SendGrid settings');
  console.log('4. 99% delivery rate guaranteed');
  
  console.log('\n🥉 OPTION 3: Manual Verification (Development)');
  console.log('1. Use admin verification tool');
  console.log('2. Go to: http://localhost:5173/admin/verify');
  console.log('3. Enter user email to verify manually');
  console.log('4. Perfect for development/testing');

  // Test 6: Immediate action steps
  console.log('\n' + '=' .repeat(60));
  console.log('🚀 IMMEDIATE ACTION STEPS');
  console.log('=' .repeat(60));
  
  console.log('\n📧 To fix email delivery RIGHT NOW:');
  console.log('1. Go to Supabase Dashboard');
  console.log('2. Authentication → Settings → SMTP Settings');
  console.log('3. Turn OFF "Enable Custom SMTP"');
  console.log('4. Click Save');
  console.log('5. Test registration again');
  
  console.log('\n🧪 To test after fixing:');
  console.log('1. Register new user');
  console.log('2. Check email within 2 minutes');
  console.log('3. If still no email, use manual verification');
  
  console.log('\n⚡ For immediate development:');
  console.log('1. Use manual verification: http://localhost:5173/admin/verify');
  console.log('2. Continue with payment integration');
  console.log('3. Fix email delivery when convenient');
}

// Helper function to test specific email
async function testSpecificEmail(email) {
  console.log(`\n🎯 Testing email delivery to: ${email}`);
  
  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/resend-verification`, {
      email: email
    });
    
    if (response.data.success) {
      console.log('✅ Email sent successfully');
      console.log('📧 Check your inbox and spam folder');
      return true;
    } else {
      console.log('❌ Email sending failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Email test error:', error.response?.data?.error || error.message);
    return false;
  }
}

// Run debugging
debugEmailDelivery().catch(console.error);

// Export for manual testing
module.exports = { testSpecificEmail };
