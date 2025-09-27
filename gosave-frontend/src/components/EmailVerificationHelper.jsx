import React, { useState } from "react";

/**
 * Development Email Verification Helper Component
 * Shows manual verification options during development
 */
const EmailVerificationHelper = ({
  userEmail,
  verificationData,
  onVerificationComplete,
}) => {
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Only show in development mode
  const isDevelopment = import.meta.env.MODE === "development";

  if (!isDevelopment || !verificationData) {
    return null;
  }

  const handleManualVerification = async (method) => {
    setVerifying(true);
    setVerificationStatus(null);

    try {
      let url;
      switch (method) {
        case "manual":
          url = verificationData.manualVerificationUrl;
          break;
        case "admin":
          url = verificationData.adminVerificationUrl;
          break;
        default:
          throw new Error("Invalid verification method");
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setVerificationStatus({
          type: "success",
          message: result.message,
        });

        // Notify parent component
        if (onVerificationComplete) {
          onVerificationComplete(result);
        }

        // Redirect after success
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        throw new Error(result.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setVerificationStatus({
        type: "info",
        message: "Link copied to clipboard!",
      });
      setTimeout(() => setVerificationStatus(null), 2000);
    });
  };

  return (
    <div className="mt-6 p-6 bg-yellow-50/90 backdrop-blur-sm border-yellow-200 border-2 rounded-3xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-royal-blue text-white">
            Development Mode
          </span>
          <h3 className="text-lg font-semibold text-gray-900">Email Verification Helper</h3>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Account Created:</strong> {userEmail}
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            In development mode, emails may not be sent. Use the options below
            to verify your account.
          </p>
        </div>

        {/* Manual Verification Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Quick Verification Options:
          </h4>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleManualVerification("manual")}
              disabled={verifying}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            >
              {verifying ? "Verifying..." : "✓ Verify Now (Manual)"}
            </button>

            <button
              onClick={() => handleManualVerification("admin")}
              disabled={verifying}
              className="px-4 py-2 border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            >
              {verifying ? "Processing..." : "👤 Admin Verify"}
            </button>
          </div>
        </div>

        {/* Copy Links Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Verification Links:</h4>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 p-2 rounded text-xs break-all">
                {verificationData.manualVerificationUrl}
              </code>
              <button
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                onClick={() =>
                  copyToClipboard(verificationData.manualVerificationUrl)
                }
              >
                Copy
              </button>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 p-2 rounded text-xs break-all">
                {verificationData.adminVerificationUrl}
              </code>
              <button
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                onClick={() =>
                  copyToClipboard(verificationData.adminVerificationUrl)
                }
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {verificationStatus && (
          <div
            className={`p-3 rounded-lg ${
              verificationStatus.type === "success"
                ? "bg-green-100 border-green-200 text-green-800"
                : verificationStatus.type === "error"
                ? "bg-red-100 border-red-200 text-red-800"
                : "bg-blue-100 border-blue-200 text-blue-800"
            }`}
          >
            <p className="text-sm font-medium">{verificationStatus.message}</p>
          </div>
        )}

        {/* Development Notes */}
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer font-medium">
            Development Notes
          </summary>
          <div className="mt-2 space-y-1">
            <p>
              • Manual verification bypasses email and instantly verifies the
              account
            </p>
            <p>• Admin verification looks up the user by email and verifies</p>
            <p>
              • In production, users will receive actual email verification
              links
            </p>
            <p>• Check the server console for additional debug information</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default EmailVerificationHelper;