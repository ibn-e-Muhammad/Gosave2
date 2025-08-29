// Comprehensive authentication system testing script
const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Test users with their credentials
const testUsers = [
  {
    email: 'admin@gosave.pk',
    password: 'admin123',
    expectedRole: 'admin',
    expectedMembership: 'premium',
    description: 'Admin User'
  },
  {
    email: 'fatima.khan@gmail.com',
    password: 'member123',
    expectedRole: 'member',
    expectedMembership: 'premium',
    description: 'Premium Member'
  },
  {
    email: 'hassan.raza@gmail.com',
    password: 'member123',
    expectedRole: 'member',
    expectedMembership: 'basic',
    description: 'Basic Member'
  },
  {
    email: 'zainab.ali@gmail.com',
    password: 'viewer123',
    expectedRole: 'viewer',
    expectedMembership: null,
    description: 'Viewer (No Membership)'
  }
];

async function testAuthenticationSystem() {
  console.log('🧪 GoSave Authentication System Testing\n');
  console.log('=' .repeat(60));

  // Test 1: API Health Check
  console.log('\n1️⃣  Testing API Health...');
  try {
    const healthResponse = await axios.get(`${API_URL}/api/v1/health`);
    console.log('✅ API Health:', healthResponse.data.message);
  } catch (error) {
    console.error('❌ API Health Check Failed:', error.message);
    console.log('   Make sure the backend server is running on port 5000');
    return;
  }

  // Test 2: Login Tests for Each User Type
  console.log('\n2️⃣  Testing Login for Each User Type...');
  
  for (const testUser of testUsers) {
    console.log(`\n   Testing ${testUser.description}:`);
    console.log(`   Email: ${testUser.email}`);
    
    try {
      const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      if (loginResponse.data.success) {
        const user = loginResponse.data.data.user;
        const token = loginResponse.data.data.access_token;
        
        console.log('   ✅ Login successful');
        console.log(`   👤 Name: ${user.full_name}`);
        console.log(`   🎭 Role: ${user.role}`);
        console.log(`   💳 Membership: ${user.membership ? user.membership.name : 'None'}`);
        
        // Verify expected role
        if (user.role === testUser.expectedRole) {
          console.log('   ✅ Role matches expected');
        } else {
          console.log(`   ❌ Role mismatch: expected ${testUser.expectedRole}, got ${user.role}`);
        }
        
        // Verify expected membership
        const actualMembership = user.membership ? user.membership.name : null;
        if (actualMembership === testUser.expectedMembership) {
          console.log('   ✅ Membership matches expected');
        } else {
          console.log(`   ❌ Membership mismatch: expected ${testUser.expectedMembership}, got ${actualMembership}`);
        }
        
        // Test 3: Protected Endpoint Access
        console.log('   🔒 Testing protected endpoint access...');
        await testProtectedEndpoints(testUser, token);
        
      } else {
        console.log('   ❌ Login failed:', loginResponse.data.error);
      }
      
    } catch (error) {
      if (error.response) {
        console.log('   ❌ Login failed:', error.response.status, error.response.data.error);
      } else {
        console.log('   ❌ Network error:', error.message);
      }
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 Testing Summary Complete');
  console.log('\n📝 Next Steps:');
  console.log('1. Test the frontend login page with these credentials');
  console.log('2. Verify protected routes work correctly');
  console.log('3. Test membership-based deal filtering');
  console.log('4. Test logout functionality');
}

async function testProtectedEndpoints(testUser, token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Test user profile endpoint
  try {
    const profileResponse = await axios.get(`${API_URL}/api/v1/auth/me`, { headers });
    if (profileResponse.data.success) {
      console.log('     ✅ Profile endpoint accessible');
    }
  } catch (error) {
    console.log('     ❌ Profile endpoint failed:', error.response?.status);
  }

  // Test deals endpoint based on user type
  try {
    if (testUser.expectedRole === 'member' || testUser.expectedRole === 'admin') {
      const dealsResponse = await axios.get(`${API_URL}/api/v1/deals/my-deals`, { headers });
      if (dealsResponse.data.success) {
        console.log(`     ✅ My deals endpoint accessible (${dealsResponse.data.count} deals)`);
        console.log(`     📊 User membership: ${dealsResponse.data.user_membership}`);
      }
    }
  } catch (error) {
    console.log('     ❌ My deals endpoint failed:', error.response?.status);
  }

  // Test admin endpoints for admin users
  if (testUser.expectedRole === 'admin') {
    try {
      const adminPartnersResponse = await axios.get(`${API_URL}/api/v1/partners/all`, { headers });
      if (adminPartnersResponse.data.success) {
        console.log(`     ✅ Admin partners endpoint accessible (${adminPartnersResponse.data.count} partners)`);
      }
    } catch (error) {
      console.log('     ❌ Admin partners endpoint failed:', error.response?.status);
    }
  }

  // Test premium endpoints for premium users
  if (testUser.expectedMembership === 'premium') {
    try {
      const premiumDealsResponse = await axios.get(`${API_URL}/api/v1/deals/premium`, { headers });
      if (premiumDealsResponse.data.success) {
        console.log(`     ✅ Premium deals endpoint accessible (${premiumDealsResponse.data.count} deals)`);
      }
    } catch (error) {
      console.log('     ❌ Premium deals endpoint failed:', error.response?.status);
    }
  }
}

// Frontend testing instructions
function printFrontendTestingInstructions() {
  console.log('\n🌐 Frontend Testing Instructions:');
  console.log('=' .repeat(60));
  
  console.log('\n1. Open the frontend application:');
  console.log('   http://localhost:5174 (or your frontend port)');
  
  console.log('\n2. Test login with each user type:');
  testUsers.forEach(user => {
    console.log(`   ${user.description}:`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Password: ${user.password}`);
    console.log('');
  });
  
  console.log('3. Verify the following after login:');
  console.log('   ✅ User is redirected to dashboard');
  console.log('   ✅ Navbar shows user avatar and name');
  console.log('   ✅ Dashboard shows correct membership info');
  console.log('   ✅ Deals page shows membership-appropriate deals');
  console.log('   ✅ Admin users can access admin dashboard');
  console.log('   ✅ Logout works correctly');
  
  console.log('\n4. Test protected routes:');
  console.log('   • Try accessing /dashboard without login (should redirect)');
  console.log('   • Try accessing /admin/dashboard as non-admin (should show access denied)');
  console.log('   • Verify membership-based deal filtering works');
}

// Run the tests
if (require.main === module) {
  testAuthenticationSystem()
    .then(() => {
      printFrontendTestingInstructions();
    })
    .catch(console.error);
}

module.exports = { testAuthenticationSystem };
