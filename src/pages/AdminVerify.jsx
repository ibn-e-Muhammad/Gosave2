import { useState } from "react";
import { Mail, CheckCircle, AlertCircle, Shield } from "lucide-react";
import Container from "../components/UI/Container";
import GlassCard from "../components/UI/GlassCard";
import Button from "../components/UI/Button";

const AdminVerify = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Only show in development
  if (import.meta.env.PROD) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <Container>
          <div className="max-w-md mx-auto">
            <GlassCard className="p-12">
              <div className="text-center space-y-6">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                <h1 className="text-2xl font-display font-bold text-white">
                  Not Available
                </h1>
                <p className="text-white/80">
                  Admin verification is only available in development mode.
                </p>
              </div>
            </GlassCard>
          </div>
        </Container>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/admin/verify-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setEmail(""); // Clear form
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center py-12">
      <Container>
        <div className="max-w-md mx-auto">
          <GlassCard className="p-12">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Shield className="w-12 h-12 text-royal-gold" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white">
                  Admin Verify
                </h1>
                <p className="text-white/70">
                  Manually verify user emails (Development Only)
                </p>
              </div>

              {/* Success Result */}
              {result && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-200 text-sm font-medium">{result.message}</p>
                      <p className="text-green-300 text-xs mt-1">
                        Email: {result.data.email}
                      </p>
                      {result.data.verified_at && (
                        <p className="text-green-300 text-xs">
                          Verified: {new Date(result.data.verified_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                      placeholder="Enter email to verify"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Verifying..." : "Verify User"}
                </Button>
              </form>

              {/* Instructions */}
              <div className="text-center space-y-3">
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-white font-medium text-sm mb-2">How to use:</h3>
                  <div className="text-white/70 text-xs space-y-1">
                    <p>1. User registers through normal flow</p>
                    <p>2. Enter their email address here</p>
                    <p>3. Click "Verify User" to manually confirm</p>
                    <p>4. User can now login successfully</p>
                  </div>
                </div>
                
                <p className="text-white/50 text-xs">
                  This tool is only available in development mode
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </Container>
    </div>
  );
};

export default AdminVerify;
