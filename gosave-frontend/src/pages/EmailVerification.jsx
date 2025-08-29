import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, AlertCircle, Mail } from "lucide-react";
import Container from "../components/UI/Container";
import GlassCard from "../components/UI/GlassCard";
import Button from "../components/UI/Button";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (!token || type !== "signup") {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email for the correct link.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/verify-email?token=${token}&type=${type}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Email verification failed. The link may be expired or invalid.");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred during verification. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Mail className="w-16 h-16 text-royal-gold animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-bold text-white">
              Verifying Email...
            </h1>
            <p className="text-white/80">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-bold text-white">
              Email Verified!
            </h1>
            <p className="text-white/80 leading-relaxed">
              {message}
            </p>
            <p className="text-white/60 text-sm">
              Your account is now active and you can log in to start saving with GoSave.
            </p>
          </div>

          <div className="space-y-4">
            <Link to="/login">
              <Button size="lg" className="w-full">
                Continue to Login
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="ghost" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="w-16 h-16 text-red-400" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-bold text-white">
              Verification Failed
            </h1>
            <p className="text-white/80 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="space-y-4">
            <Link to="/register">
              <Button size="lg" className="w-full">
                Try Registration Again
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Back to Login
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="ghost" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
      <Container>
        <div className="max-w-md mx-auto">
          <GlassCard className="p-12">
            {renderContent()}
          </GlassCard>
        </div>
      </Container>
    </div>
  );
};

export default EmailVerification;
