import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Container from "../components/UI/Container";
import GlassCard from "../components/UI/GlassCard";
import Button from "../components/UI/Button";
import EmailVerificationHelper from "../components/EmailVerificationHelper";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [registrationResult, setRegistrationResult] = useState(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.email = "Email is required";
        } else if (!emailRegex.test(value)) {
          errors.email = "Please enter a valid email address";
        } else {
          delete errors.email;
        }
        break;

      case "password":
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        if (!value) {
          errors.password = "Password is required";
        } else if (!passwordRegex.test(value)) {
          errors.password =
            "Password must be at least 8 characters with uppercase, lowercase, and number";
        } else {
          delete errors.password;
        }
        break;

      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          errors.confirmPassword = "Passwords do not match";
        } else {
          delete errors.confirmPassword;
        }
        break;

      case "full_name":
        if (!value.trim()) {
          errors.full_name = "Full name is required";
        } else if (value.trim().length < 2) {
          errors.full_name = "Full name must be at least 2 characters";
        } else {
          delete errors.full_name;
        }
        break;

      case "phone":
        if (value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
          errors.phone = "Please enter a valid phone number";
        } else {
          delete errors.phone;
        }
        break;
    }

    setValidationErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Final validation
    Object.keys(formData).forEach((key) => {
      if (key !== "phone") {
        // phone is optional
        validateField(key, formData[key]);
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      // Try enhanced auth system first
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/v1/auth-enhanced/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          password: formData.password,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setError("");
        setRegistrationResult(data);

        // In development, show helper immediately
        if (data.development) {
          console.log("🔧 Development registration successful:", data);
        }
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Enhanced registration failed, trying fallback:", error);

      // Fallback to original auth system
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/api/v1/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email.toLowerCase(),
              password: formData.password,
              full_name: formData.full_name.trim(),
              phone: formData.phone.trim() || null,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          setSuccess(true);
          setError("");
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
      } catch (fallbackError) {
        console.error("Registration failed:", fallbackError);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/v1/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setError("");
        // Could add a success message here
      } else {
        setError(data.error || "Failed to resend verification email.");
      }
    } catch (error) {
      console.error("Resend verification failed:", error);
      setError("Failed to resend verification email.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <Container>
          <div className="max-w-md mx-auto">
            <GlassCard className="p-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-display font-bold text-white">
                    Account Created!
                  </h1>
                  <p className="text-white/80 leading-relaxed">
                    We've sent a verification email to{" "}
                    <strong>{formData.email}</strong>. Please check your inbox
                    and click the verification link to activate your account.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={resendVerification}
                    variant="secondary"
                    className="w-full"
                  >
                    Resend Verification Email
                  </Button>

                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Development Email Verification Helper */}
              {registrationResult?.development && (
                <EmailVerificationHelper
                  userEmail={formData.email}
                  verificationData={registrationResult.development}
                  onVerificationComplete={(result) => {
                    console.log("Verification completed:", result);
                    // Could redirect to login or dashboard here
                  }}
                />
              )}
            </GlassCard>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center py-12">
      <Container>
        <div className="max-w-md mx-auto">
          <GlassCard className="p-12">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-display font-bold text-white">
                  Create Account
                </h1>
                <p className="text-white/70">
                  Join GoSave and start saving today
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <input
                        name="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="Full Name"
                      />
                    </div>
                    {validationErrors.full_name && (
                      <p className="text-red-300 text-sm mt-1">
                        {validationErrors.full_name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="Email Address"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-red-300 text-sm mt-1">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone (Optional) */}
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="Phone Number (Optional)"
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-red-300 text-sm mt-1">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-300 text-sm mt-1">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="Confirm Password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-red-300 text-sm mt-1">
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || Object.keys(validationErrors).length > 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center">
                <p className="text-white/60 text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-royal-gold hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </Container>
    </div>
  );
};

export default Register;
