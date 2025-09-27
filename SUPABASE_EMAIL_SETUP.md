/\*\*

- Supabase Email Configuration Guide for GoSave
-
- This guide shows how to enable email sending in Supabase for free
  \*/

# 🔧 How to Enable FREE Email Sending in Supabase

## Method 1: Use Supabase's Built-in Email Service (FREE)

### Step 1: Configure Supabase Auth Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** > **Settings**
4. Scroll down to **Email Templates** section

### Step 2: Enable Email Confirmation

1. In **Auth Settings**, make sure:
   - ✅ **Enable email confirmations** is ON
   - ✅ **Confirm email** is ON
   - ✅ Set **Site URL** to: `http://localhost:5173` (development) or your production URL

### Step 3: Customize Email Templates (Optional)

1. Go to **Authentication** > **Email Templates**
2. Edit the **Confirm signup** template
3. You can customize the email design and content

### Step 4: Test Email Sending

The enhanced auth system will now automatically send emails through Supabase!

---

## Method 2: Use Gmail SMTP (If you want custom emails)

### Step 1: Enable Gmail SMTP in Supabase

1. Go to **Authentication** > **Settings**
2. Scroll to **SMTP Settings**
3. Configure:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: your-app-password (NOT your Gmail password!)
   SMTP Sender Name: GoSave
   SMTP Sender Email: your-email@gmail.com
   ```

### Step 2: Get Gmail App Password

1. Go to Gmail Settings: https://myaccount.google.com/security
2. Enable **2-Factor Authentication** (required)
3. Go to **App Passwords**
4. Generate a new app password for "Mail"
5. Use this 16-character password in Supabase SMTP settings

### Step 3: Test Email Configuration

```javascript
// Test email in your backend
const { data, error } = await supabase.auth.admin.inviteUserByEmail(
  "test@example.com",
  { redirectTo: "http://localhost:5173/email-verification" }
);
```

---

## Method 3: Verify Current Configuration

### Run this test script:

```javascript
// gosave-backend/test-email-config.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEmailConfig() {
  console.log("🧪 Testing Supabase Email Configuration\n");

  try {
    // Test 1: Generate email link
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email: "test@example.com",
      });

    if (linkError) {
      console.log("❌ Link generation failed:", linkError.message);
    } else {
      console.log("✅ Email link generated successfully");
      console.log("🔗 Link:", linkData?.properties?.action_link);
    }

    // Test 2: Invite user (sends email)
    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail("test@example.com", {
        redirectTo: "http://localhost:5173",
      });

    if (inviteError) {
      console.log("❌ Email invitation failed:", inviteError.message);
    } else {
      console.log("✅ Email invitation sent successfully");
    }
  } catch (error) {
    console.log("❌ Email test failed:", error.message);
  }
}

testEmailConfig();
```

---

## 🎯 Current Status Check

### What to Check in Supabase Dashboard:

1. **Auth Settings** > Email confirmations: ON
2. **Auth Settings** > Site URL: Set correctly
3. **Email Templates** > Confirm signup: Configured
4. **SMTP Settings** > Either use default or configure Gmail

### Expected Result:

- ✅ Users receive email verification links
- ✅ Manual verification still works as fallback
- ✅ Development workflow is smooth

---

## 🚨 Troubleshooting

### If emails still don't send:

1. Check Supabase logs in Dashboard > Logs
2. Verify email address is valid
3. Check spam/junk folder
4. Use manual verification as fallback
5. Contact Supabase support (they're very responsive!)

### Quick Fix:

The enhanced auth system has manual verification built-in, so users can always verify accounts even if emails fail!
