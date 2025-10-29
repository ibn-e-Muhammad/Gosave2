import { useState } from "react";
import { Search, Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import Button from "../UI/Button";
import GlassCard from "../UI/GlassCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ApplicationStatusChecker = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckStatus = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/partners/application-status/${encodeURIComponent(
          email
        )}`
      );
      const result = await response.json();

      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.error || "Application not found");
      }
    } catch (err) {
      console.error("Error checking application status:", err);
      setError("Failed to check application status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusType) => {
    switch (statusType) {
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "approved":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "rejected":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <GlassCard className="p-8">
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 text-royal-gold mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Check Application Status
          </h2>
          <p className="text-white/70">
            Enter your email address to check your partner application status
          </p>
        </div>

        <form onSubmit={handleCheckStatus} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full flex items-center justify-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Check Status
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Status Result */}
        {status && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {getStatusIcon(status.status)}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {status.brandName}
              </h3>
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  status.status
                )}`}
              >
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <p className="text-white font-medium text-lg mb-2">
                  {status.message}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Application ID:</span>
                  <p className="text-white font-mono">{status.applicationId}</p>
                </div>

                <div>
                  <span className="text-white/60">Submitted On:</span>
                  <p className="text-white">{formatDate(status.submittedAt)}</p>
                </div>

                {status.processedAt && (
                  <div>
                    <span className="text-white/60">Processed On:</span>
                    <p className="text-white">
                      {formatDate(status.processedAt)}
                    </p>
                  </div>
                )}

                {status.rejectionReason && (
                  <div className="md:col-span-2">
                    <span className="text-white/60">Reason:</span>
                    <p className="text-red-400 mt-1">
                      {status.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {status.status === "approved" && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                  <h4 className="text-green-400 font-semibold mb-2">
                    Next Steps:
                  </h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>
                      • Check your email for partner portal access details
                    </li>
                    <li>
                      • Log in to your partner account to start creating deals
                    </li>
                    <li>• Contact our support team if you need assistance</li>
                  </ul>
                </div>
              )}

              {status.status === "rejected" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                  <h4 className="text-red-400 font-semibold mb-2">
                    What you can do:
                  </h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Contact our support team for more details</li>
                    <li>• Address the concerns mentioned and reapply</li>
                    <li>• Email us at support@gosave.com for assistance</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ApplicationStatusChecker;
