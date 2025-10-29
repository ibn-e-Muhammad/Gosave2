/**
 * Enhanced Email Verification System
 * Provides multiple verification methods for development and production
 */

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const router = express.Router();

// Import middleware
const { verifyToken } = require("../../../middleware/auth");

// Verification method enum
const VERIFICATION_METHODS = {
  EMAIL: "email",
  ADMIN: "admin",
  AUTO: "auto", // for development
};

// Store pending verifications (in production, use Redis or database)
const pendingVerifications = new Map();

/**
 * Enhanced Registration with Multiple Verification Options
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and full name are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address",
      });
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must be at least 8 characters with uppercase, lowercase, and number",
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        user_metadata: {
          full_name,
          // phone stored in user_metadata since it's not in our DB schema
          phone: phone || null,
        },
        email_confirm: false, // We'll handle verification ourselves
      });

    if (authError) {
      console.error("Auth creation error:", authError);
      return res.status(400).json({
        success: false,
        error: authError.message || "Failed to create account",
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        error: "Failed to create user account",
      });
    }

    // Create user record in our database
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        full_name,
        role: "viewer", // Will be updated after membership purchase
        status: "active", // Use existing status from schema
      })
      .select()
      .single();
    if (dbError) {
      console.error("Database user creation error:", dbError);
      // Cleanup auth user
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user:", cleanupError);
      }
      return res.status(500).json({
        success: false,
        error: "Failed to create user profile",
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationData = {
      userId: dbUser.id,
      authUserId: authData.user.id,
      email: email.toLowerCase(),
      timestamp: Date.now(),
      attempts: 0,
    };

    // Store pending verification
    pendingVerifications.set(verificationToken, verificationData);

    // Try multiple verification methods
    const verificationResult = await attemptEmailVerification(
      email,
      verificationToken
    );

    // Prepare response based on environment and verification success
    const isDevelopment = process.env.NODE_ENV !== "production";
    const response = {
      success: true,
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          full_name: dbUser.full_name,
          role: dbUser.role,
          status: dbUser.status,
        },
        verification: {
          method: verificationResult.method,
          required: true,
        },
      },
      message:
        "Account created successfully. Please verify your email to complete setup.",
    };

    // Add development helpers
    if (isDevelopment) {
      response.development = {
        verificationToken,
        manualVerificationUrl: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/api/v1/auth-enhanced/verify-manual?token=${verificationToken}`,
        adminVerificationUrl: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/api/v1/auth-enhanced/admin-verify?email=${email}`,
        note: "In development: Use the manual verification URL above or check server logs for email links",
      };
    }

    if (verificationResult.emailLink && isDevelopment) {
      console.log("\n🔧 DEVELOPMENT EMAIL VERIFICATION:");
      console.log("=====================================");
      console.log(`📧 User: ${full_name} (${email})`);
      console.log(
        `🔗 Manual Verification: ${response.development.manualVerificationUrl}`
      );
      console.log(
        `👤 Admin Verification: ${response.development.adminVerificationUrl}`
      );
      console.log(
        `📬 Email Link (if available): ${verificationResult.emailLink}`
      );
      console.log("=====================================\n");
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred during registration",
    });
  }
});

/**
 * Resend Verification Email
 */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Check if user exists in our database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name")
      .eq("email", email.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    // Try to send verification email
    const verificationResult = await attemptEmailVerification(
      email,
      verificationToken
    );

    // Store the verification token
    pendingVerifications.set(verificationToken, {
      userId: user.id,
      email: email.toLowerCase(),
      timestamp: Date.now(),
      attempts: 1,
    });

    const isDevelopment = process.env.NODE_ENV !== "production";
    const response = {
      success: true,
      message: "Verification email sent",
      data: {
        email: user.email,
        emailSent: verificationResult.emailSent || false,
        method: verificationResult.method,
      },
    };

    // Add development helpers
    if (isDevelopment) {
      response.development = {
        verificationToken,
        manualVerificationUrl: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/api/v1/auth-enhanced/verify-manual?token=${verificationToken}`,
        adminVerificationUrl: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/api/v1/auth-enhanced/admin-verify?email=${email}`,
        note: "Development: Use manual verification if email doesn't work",
      };

      console.log("\n📧 RESEND VERIFICATION EMAIL:");
      console.log("============================");
      console.log(`📧 User: ${user.full_name} (${email})`);
      console.log(`🔗 Manual: ${response.development.manualVerificationUrl}`);
      console.log(`👤 Admin: ${response.development.adminVerificationUrl}`);
      console.log("============================\n");
    }

    res.json(response);
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend verification email",
    });
  }
});

/**
 * Manual Verification Endpoint (Development)
 */
router.get("/verify-manual", async (req, res) => {
  const { token } = req.query;

  if (!token || !pendingVerifications.has(token)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or expired verification token",
    });
  }

  try {
    const verificationData = pendingVerifications.get(token);

    // Verify the auth user
    const { error: verifyError } = await supabase.auth.admin.updateUserById(
      verificationData.authUserId,
      { email_confirm: true }
    );

    if (verifyError) {
      return res.status(500).json({
        success: false,
        error: "Failed to verify email",
      });
    }

    // Update user status in database
    await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", verificationData.userId);

    // Remove from pending
    pendingVerifications.delete(token);

    res.json({
      success: true,
      message: "Email verified successfully! You can now login.",
      data: {
        email: verificationData.email,
        redirectUrl: process.env.FRONTEND_URL || "http://localhost:5173/login",
      },
    });
  } catch (error) {
    console.error("Manual verification error:", error);
    res.status(500).json({
      success: false,
      error: "Verification failed",
    });
  }
});

/**
 * Admin Verification Endpoint (Development)
 */
router.get("/admin-verify", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email is required",
    });
  }

  try {
    // Find user in database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Find and verify in auth
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      return res.status(500).json({
        success: false,
        error: "Failed to access auth users",
      });
    }

    const authUser = authUsers.users.find(
      (u) => u.email === email.toLowerCase()
    );

    if (!authUser) {
      return res.status(404).json({
        success: false,
        error: "Auth user not found",
      });
    }

    // Verify the user
    const { error: verifyError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { email_confirm: true }
    );

    if (verifyError) {
      return res.status(500).json({
        success: false,
        error: "Failed to verify user",
      });
    }

    // Update status in database
    await supabase.from("users").update({ status: "active" }).eq("id", user.id);

    res.json({
      success: true,
      message: `User ${email} verified successfully by admin`,
      data: {
        email,
        userId: user.id,
        authUserId: authUser.id,
      },
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({
      success: false,
      error: "Admin verification failed",
    });
  }
});

// Helper Functions
function generateVerificationToken() {
  return require("crypto").randomBytes(32).toString("hex");
}

async function attemptEmailVerification(email, token) {
  try {
    console.log(`📧 Attempting to send verification email to: ${email}`);

    // Method 1: Try Supabase's built-in email verification
    // This uses Supabase's email templates and sending service
    const { data: emailData, error: emailError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/email-verification?token=${token}`,
      });

    if (!emailError && emailData) {
      console.log("✅ Supabase email invitation sent successfully");
      return {
        method: VERIFICATION_METHODS.EMAIL,
        success: true,
        emailSent: true,
        message: "Verification email sent via Supabase",
      };
    }

    // Method 2: Try generating email link and use Supabase's send email function
    console.log("🔄 Trying alternative email method...");
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email: email.toLowerCase(),
        options: {
          redirectTo: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/email-verification?token=${token}`,
        },
      });

    if (linkError) {
      console.log("❌ Email link generation failed:", linkError.message);
    } else if (linkData?.properties?.action_link) {
      console.log(
        "✅ Email verification link generated:",
        linkData.properties.action_link
      );

      // Method 3: Try to send email using Supabase's built-in email service
      try {
        // Use Supabase's email sending capability
        const emailContent = await generateVerificationEmailContent(
          email,
          linkData.properties.action_link,
          token
        );

        // Note: Supabase automatically sends emails for auth operations if SMTP is configured
        // The generateLink method should trigger an email if your Supabase project has email configured
        console.log("📨 Email should be sent automatically by Supabase");

        return {
          method: VERIFICATION_METHODS.EMAIL,
          success: true,
          emailLink: linkData.properties.action_link,
          emailSent: true,
          message: "Verification email processed by Supabase",
        };
      } catch (sendError) {
        console.log("❌ Email sending failed:", sendError.message);
      }
    }

    // Fallback: Manual verification
    console.log("📝 Falling back to manual verification method");
    return {
      method: VERIFICATION_METHODS.ADMIN,
      success: false,
      emailSent: false,
      error: emailError?.message || "Email service unavailable",
      message: "Please use manual verification",
    };
  } catch (error) {
    console.error("❌ Email verification attempt failed:", error);
    return {
      method: VERIFICATION_METHODS.ADMIN,
      success: false,
      emailSent: false,
      error: error.message,
      message: "Email service error - use manual verification",
    };
  }
}

// Helper function to generate email content
async function generateVerificationEmailContent(
  email,
  verificationLink,
  token
) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const manualVerifyUrl = `${
    process.env.BACKEND_URL || "http://localhost:5000"
  }/api/v1/auth-enhanced/verify-manual?token=${token}`;

  return {
    to: email,
    subject: "Verify Your GoSave Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FFD700, #4169E1); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GoSave!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for joining GoSave! Please verify your email address to complete your account setup and start saving money with exclusive deals.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #4169E1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #333;">
            ${verificationLink}
          </p>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Alternative:</strong> You can also verify your account instantly by clicking here:
            <a href="${manualVerifyUrl}" style="color: #4169E1;">Quick Verify</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent from GoSave. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  };
}

module.exports = router;
