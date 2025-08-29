# GoSave Frontend Testing Guide

## 🎯 Complete Authentication System Testing

### **Prerequisites**
- Backend server running on `http://localhost:5000`
- Frontend application running on `http://localhost:5173` (or your port)
- All test credentials available

### **Test Credentials**
```
Admin User:
📧 Email: admin@gosave.pk
🔑 Password: admin123

Premium Member:
📧 Email: fatima.khan@gmail.com
🔑 Password: member123

Basic Member:
📧 Email: hassan.raza@gmail.com
🔑 Password: member123

Viewer (No Membership):
📧 Email: zainab.ali@gmail.com
🔑 Password: viewer123
```

## 🧪 Testing Checklist

### **1. Login Flow Testing**

#### **Test 1.1: Admin Login**
- [ ] Navigate to login page
- [ ] Enter admin credentials
- [ ] Verify successful login
- [ ] Check redirect to dashboard
- [ ] Verify admin user info displayed in navbar
- [ ] Confirm admin dashboard access

#### **Test 1.2: Premium Member Login**
- [ ] Logout if logged in
- [ ] Login with premium member credentials
- [ ] Verify successful login
- [ ] Check membership status shows "Premium"
- [ ] Verify access to premium deals

#### **Test 1.3: Basic Member Login**
- [ ] Logout and login with basic member credentials
- [ ] Verify membership status shows "Basic"
- [ ] Confirm limited deal access (no premium deals)

#### **Test 1.4: Viewer Login**
- [ ] Login with viewer credentials
- [ ] Verify limited access (profile only)
- [ ] Confirm no deals access

### **2. Protected Routes Testing**

#### **Test 2.1: Unauthenticated Access**
- [ ] Logout completely
- [ ] Try to access `/dashboard` directly
- [ ] Verify redirect to login page
- [ ] Try to access `/admin/dashboard`
- [ ] Verify redirect to login page

#### **Test 2.2: Role-Based Access**
- [ ] Login as non-admin user
- [ ] Try to access `/admin/dashboard`
- [ ] Verify access denied or redirect
- [ ] Login as admin
- [ ] Verify admin dashboard access

### **3. Data Access Testing**

#### **Test 3.1: Deals Page**
- [ ] Login as basic member
- [ ] Navigate to deals page
- [ ] Count visible deals (should be limited)
- [ ] Logout and login as premium member
- [ ] Navigate to deals page
- [ ] Verify more deals visible
- [ ] Check for premium-only deals

#### **Test 3.2: Dashboard Data**
- [ ] Login as each user type
- [ ] Verify dashboard shows correct user info
- [ ] Check membership information accuracy
- [ ] Verify role-specific content

#### **Test 3.3: Partners Page**
- [ ] Access partners page as different user types
- [ ] Verify all users see approved partners
- [ ] Login as admin
- [ ] Check if admin sees additional partner data

### **4. Authentication State Testing**

#### **Test 4.1: Session Persistence**
- [ ] Login successfully
- [ ] Refresh the page
- [ ] Verify user remains logged in
- [ ] Navigate between pages
- [ ] Confirm authentication persists

#### **Test 4.2: Token Expiration**
- [ ] Login successfully
- [ ] Wait for token to expire (or simulate)
- [ ] Try to access protected content
- [ ] Verify proper handling of expired tokens

#### **Test 4.3: Logout Functionality**
- [ ] Login successfully
- [ ] Click logout button
- [ ] Verify redirect to login/home page
- [ ] Try to access protected routes
- [ ] Confirm access is denied

### **5. Error Handling Testing**

#### **Test 5.1: Invalid Credentials**
- [ ] Try login with wrong password
- [ ] Verify error message displayed
- [ ] Try login with non-existent email
- [ ] Verify appropriate error handling

#### **Test 5.2: Network Errors**
- [ ] Disconnect internet/stop backend
- [ ] Try to login
- [ ] Verify error handling
- [ ] Reconnect and verify recovery

### **6. UI/UX Testing**

#### **Test 6.1: Loading States**
- [ ] Verify loading indicators during login
- [ ] Check loading states for data fetching
- [ ] Confirm smooth transitions

#### **Test 6.2: Responsive Design**
- [ ] Test on different screen sizes
- [ ] Verify mobile responsiveness
- [ ] Check tablet view

#### **Test 6.3: User Feedback**
- [ ] Verify success messages
- [ ] Check error message clarity
- [ ] Confirm user guidance is clear

## ✅ Expected Results

### **Successful Test Outcomes:**

1. **Authentication Flow:**
   - All user types can login successfully
   - Proper redirects after login
   - Correct user information displayed

2. **Authorization:**
   - Role-based access working correctly
   - Membership-based content filtering
   - Protected routes properly secured

3. **Data Security:**
   - Users only see appropriate data
   - Premium content restricted to premium users
   - Admin content restricted to admins

4. **User Experience:**
   - Smooth login/logout flow
   - Clear error messages
   - Responsive design working

## 🚨 Troubleshooting

### **Common Issues:**

1. **Login Fails:**
   - Check backend server is running
   - Verify credentials are correct
   - Check browser console for errors

2. **Protected Routes Not Working:**
   - Verify token is being sent in requests
   - Check authentication middleware
   - Confirm user context is available

3. **Data Not Loading:**
   - Check API endpoints are responding
   - Verify database connection
   - Check for CORS issues

### **Debug Steps:**

1. Open browser developer tools
2. Check Network tab for API calls
3. Look for error messages in Console
4. Verify localStorage/sessionStorage for tokens
5. Check backend logs for errors

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

Login Flow: ✅ / ❌
Protected Routes: ✅ / ❌
Data Access: ✅ / ❌
Authentication State: ✅ / ❌
Error Handling: ✅ / ❌
UI/UX: ✅ / ❌

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Status: ✅ PASS / ❌ FAIL
```

## 🎉 Success Criteria

The authentication system is considered fully functional when:

- ✅ All user types can login successfully
- ✅ Protected routes are properly secured
- ✅ Role-based access control works
- ✅ Membership-based filtering functions
- ✅ User sessions persist correctly
- ✅ Logout works properly
- ✅ Error handling is robust
- ✅ UI provides good user experience
