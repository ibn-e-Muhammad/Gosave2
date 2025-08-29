# 📧 Supabase Email Configuration Guide for GoSave

## 🎯 Complete Step-by-Step Instructions

### **Step 1: Access Supabase Dashboard**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Login to your account
3. Select your GoSave project: `iwljpviagpfewdjswnhs`

### **Step 2: Configure Authentication Settings**
1. **Navigate to Authentication**:
   - Click "Authentication" in the left sidebar
   - Click "Settings" tab

2. **Enable Email Confirmations**:
   - Scroll to "User Signups" section
   - ✅ **CRITICAL**: Ensure "Enable email confirmations" is **CHECKED**
   - If unchecked, this is why emails aren't being sent!

3. **Configure Site URL**:
   - Set "Site URL" to: `http://localhost:5173` (development)
   - For production, change to your domain: `https://yourdomain.com`

4. **Configure Redirect URLs**:
   - Add redirect URLs for email verification:
   - Development: `http://localhost:5173/verify-email`
   - Production: `https://yourdomain.com/verify-email`

### **Step 3: Configure Email Templates**
1. **Navigate to Email Templates**:
   - Click "Authentication" → "Email Templates"

2. **Configure "Confirm signup" Template**:
   - Click on "Confirm signup" template
   - ✅ **CRITICAL**: Ensure template is **ENABLED**
   - Customize the email content (optional):

```html
<h2>Welcome to GoSave!</h2>
<p>Thank you for signing up. Please click the link below to verify your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>If you didn't create an account with us, please ignore this email.</p>
<p>Best regards,<br>The GoSave Team</p>
```

3. **Set Redirect URL in Template**:
   - Ensure the confirmation URL redirects to: `/verify-email`

### **Step 4: Configure SMTP (Optional but Recommended)**
1. **Navigate to Authentication → Settings**
2. **Scroll to "SMTP Settings"**
3. **Choose SMTP Provider** (recommended options):

#### **Option A: SendGrid (Recommended)**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
Sender Email: noreply@yourdomain.com
Sender Name: GoSave
```

#### **Option B: Mailgun**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Your Mailgun SMTP Username]
SMTP Pass: [Your Mailgun SMTP Password]
Sender Email: noreply@yourdomain.com
Sender Name: GoSave
```

#### **Option C: Gmail (Development Only)**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-gmail@gmail.com
SMTP Pass: [App Password - not regular password]
Sender Email: your-gmail@gmail.com
Sender Name: GoSave
```

### **Step 5: Test Email Configuration**
1. **Save all settings**
2. **Test with a real email address**:
   - Register a new user with your actual email
   - Check inbox (and spam folder)
   - Verify email delivery works

### **Step 6: Domain Verification (Production)**
For production, you'll need to:
1. **Verify your domain** with your email provider
2. **Set up SPF/DKIM records** for better deliverability
3. **Configure proper sender domain**

## 🔧 Troubleshooting Common Issues

### **Issue 1: "Enable email confirmations" is unchecked**
- **Solution**: Check the box in Authentication → Settings
- **This is the most common cause of missing emails**

### **Issue 2: Wrong redirect URL**
- **Solution**: Ensure redirect URLs match your frontend routes
- Development: `http://localhost:5173/verify-email`
- Production: `https://yourdomain.com/verify-email`

### **Issue 3: SMTP not configured**
- **Solution**: Set up custom SMTP provider (SendGrid recommended)
- Default Supabase email has limitations

### **Issue 4: Emails going to spam**
- **Solution**: 
  - Configure SPF/DKIM records
  - Use verified domain
  - Use reputable SMTP provider

### **Issue 5: Template not enabled**
- **Solution**: Enable "Confirm signup" template in Email Templates

## 🧪 Testing Checklist

After configuration, test the following:

- [ ] Register new user with real email address
- [ ] Check email inbox (and spam folder)
- [ ] Click verification link
- [ ] Verify redirect to `/verify-email` page
- [ ] Confirm user can login after verification
- [ ] Test resend verification functionality

## 🚀 Production Deployment Checklist

Before going live:

- [ ] Configure custom SMTP provider
- [ ] Set up domain verification
- [ ] Configure SPF/DKIM records
- [ ] Update Site URL to production domain
- [ ] Update redirect URLs to production
- [ ] Test email delivery thoroughly
- [ ] Disable admin verification endpoint
- [ ] Monitor email delivery rates

## 📊 Expected Results

After proper configuration:
- ✅ Users receive verification emails within 1-2 minutes
- ✅ Emails have professional appearance
- ✅ Verification links work correctly
- ✅ Users can complete registration flow
- ✅ Email delivery rate > 95%

## 🔗 Useful Links

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SendGrid Setup Guide](https://sendgrid.com/docs/for-developers/sending-email/getting-started-smtp/)
- [Mailgun Setup Guide](https://documentation.mailgun.com/en/latest/quickstart-sending.html)
