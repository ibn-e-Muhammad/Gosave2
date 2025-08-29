# 🔧 Supabase Email Settings Verification Checklist

## 📋 CRITICAL SETTINGS TO CHECK

### **1. Authentication Settings**
Go to: **Supabase Dashboard → Authentication → Settings**

#### **User Signups Section:**
- [ ] ✅ **"Enable email confirmations"** MUST be checked
- [ ] ✅ **"Enable phone confirmations"** can be unchecked
- [ ] ✅ **"Double confirm email changes"** recommended checked

#### **Site URL:**
- [ ] Development: `http://localhost:5173`
- [ ] Production: `https://yourdomain.com`

#### **Redirect URLs:**
Add these URLs (one per line):
```
http://localhost:5173/**
http://localhost:5173/verify-email
https://yourdomain.com/** (for production)
```

### **2. Email Templates**
Go to: **Supabase Dashboard → Authentication → Email Templates**

#### **Confirm signup template:**
- [ ] ✅ **Template ENABLED** (toggle switch on)
- [ ] ✅ **Subject**: "Confirm your signup"
- [ ] ✅ **Body**: Your custom HTML template
- [ ] ✅ **Redirect URL**: Leave blank or set to `/verify-email`

### **3. SMTP Settings**
Go to: **Supabase Dashboard → Authentication → Settings → SMTP Settings**

#### **Correct Gmail Configuration:**
```
✅ Enable Custom SMTP: ON
✅ Sender email: muhammadarslan23156@gmail.com
✅ Sender name: GoSave Team
✅ Host: smtp.gmail.com
✅ Port: 587
✅ Username: muhammadarslan23156@gmail.com
✅ Password: [16-character Gmail App Password]
✅ Minimum interval: 30 seconds
```

#### **❌ WRONG Settings (What NOT to use):**
```
❌ Host: http://localhost:5173 (This is wrong!)
❌ Host: localhost (This is wrong!)
❌ Username: Muhammad Arslan (Use email instead)
❌ Password: [Regular Gmail password] (Use App Password)
```

## 🔧 **STEP-BY-STEP FIX PROCESS**

### **Step 1: Fix SMTP Settings**
1. Go to Supabase Dashboard → Authentication → Settings
2. Scroll to "SMTP Settings"
3. **Replace ALL settings** with the correct Gmail configuration above
4. Click "Save"

### **Step 2: Verify Email Confirmations**
1. In the same page, scroll to "User Signups"
2. **Ensure "Enable email confirmations" is CHECKED**
3. Click "Save" if you made changes

### **Step 3: Check Email Template**
1. Go to Authentication → Email Templates
2. Click "Confirm signup"
3. **Ensure the toggle is ON (enabled)**
4. Verify your custom template is there
5. Click "Save"

### **Step 4: Test Configuration**
1. Run the test script: `node test-supabase-email-config.js`
2. Register with a real email address you can check
3. Check inbox and spam folder within 2 minutes

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Gmail App Password**
**Problem**: Using regular Gmail password
**Solution**: 
1. Enable 2FA on Gmail account
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the 16-character code (e.g., `abcd efgh ijkl mnop`)

### **Issue 2: Wrong SMTP Host**
**Problem**: Using `http://localhost:5173` as SMTP host
**Solution**: Change to `smtp.gmail.com`

### **Issue 3: Email Confirmations Disabled**
**Problem**: "Enable email confirmations" is unchecked
**Solution**: Check the box in Authentication → Settings

### **Issue 4: Template Disabled**
**Problem**: "Confirm signup" template is disabled
**Solution**: Enable the template in Email Templates

### **Issue 5: Wrong Redirect URLs**
**Problem**: Verification links don't redirect properly
**Solution**: Add correct redirect URLs in Authentication → Settings

## 📧 **ALTERNATIVE SMTP PROVIDERS**

If Gmail continues to have issues, consider these alternatives:

### **SendGrid (Recommended for Production):**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
```

### **Mailgun:**
```
Host: smtp.mailgun.org
Port: 587
Username: [Your Mailgun SMTP Username]
Password: [Your Mailgun SMTP Password]
```

## ✅ **SUCCESS INDICATORS**

You'll know it's working when:
- [ ] Registration completes successfully
- [ ] Verification email arrives within 1-2 minutes
- [ ] Email appears in inbox (not spam)
- [ ] Verification link works when clicked
- [ ] User can login after verification

## 🧪 **TESTING COMMANDS**

```bash
# Test email configuration
node test-supabase-email-config.js

# Test with your real email
# (Modify the script to use your actual email)

# Manual verification if emails fail
# Go to: http://localhost:5173/admin/verify
```

## 📞 **NEXT STEPS**

1. **Fix SMTP settings** using the exact Gmail configuration above
2. **Verify email confirmations** are enabled
3. **Test with real email** using the test script
4. **Check inbox and spam** within 2 minutes
5. **Use manual verification** if emails still don't arrive
