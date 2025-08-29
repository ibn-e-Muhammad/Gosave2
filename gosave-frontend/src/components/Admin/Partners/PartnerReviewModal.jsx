import React, { useState } from "react";

const PartnerReviewModal = ({ partner, onClose, onApprove, onReject }) => {
  const [action, setAction] = useState(""); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!action) {
      alert("Please select an action (Approve or Reject)");
      return;
    }

    if (action === "reject" && rejectionReason.trim().length < 5) {
      alert("Rejection reason must be at least 5 characters long");
      return;
    }

    setLoading(true);

    try {
      if (action === "approve") {
        await onApprove(partner.id, notes);
      } else {
        await onReject(partner.id, rejectionReason, notes);
      }
    } catch (error) {
      console.error("Error processing partner review:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!partner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Partner Review</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Partner Details */}
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-medium text-white mb-4">
              {partner.brandName}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">
                  <strong>Owner:</strong>
                </p>
                <p className="text-white mb-2">{partner.ownerName}</p>

                <p className="text-gray-400">
                  <strong>Email:</strong>
                </p>
                <p className="text-white mb-2">{partner.email}</p>

                <p className="text-gray-400">
                  <strong>Phone:</strong>
                </p>
                <p className="text-white mb-2">
                  {partner.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-400">
                  <strong>Business Type:</strong>
                </p>
                <p className="text-white mb-2">{partner.businessType}</p>

                <p className="text-gray-400">
                  <strong>Website:</strong>
                </p>
                <p className="text-white mb-2">
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {partner.website}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>

                <p className="text-gray-400">
                  <strong>Location:</strong>
                </p>
                <p className="text-white mb-2">{partner.city}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">
                    <strong>Discount Range:</strong>
                  </p>
                  <p className="text-white">{partner.discountRange}</p>
                </div>
                <div>
                  <p className="text-gray-400">
                    <strong>Contract Duration:</strong>
                  </p>
                  <p className="text-white">
                    {partner.contractDuration} months
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">
                    <strong>Applied On:</strong>
                  </p>
                  <p className="text-white">
                    {new Date(partner.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {partner.address && (
                <div className="mt-3">
                  <p className="text-gray-400">
                    <strong>Address:</strong>
                  </p>
                  <p className="text-white">{partner.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Review Decision *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="approve"
                    checked={action === "approve"}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-green-400 font-medium">
                    Approve Partner
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="reject"
                    checked={action === "reject"}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-red-400 font-medium">
                    Reject Application
                  </span>
                </label>
              </div>
            </div>

            {/* Rejection Reason (if rejecting) */}
            {action === "reject" && (
              <div>
                <label
                  htmlFor="rejectionReason"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Rejection Reason *
                </label>
                <select
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select rejection reason...</option>
                  <option value="Incomplete application information">
                    Incomplete application information
                  </option>
                  <option value="Business type not aligned with platform">
                    Business type not aligned with platform
                  </option>
                  <option value="Invalid or suspicious business details">
                    Invalid or suspicious business details
                  </option>
                  <option value="Discount range too low">
                    Discount range too low
                  </option>
                  <option value="Unable to verify business legitimacy">
                    Unable to verify business legitimacy
                  </option>
                  <option value="Duplicate application">
                    Duplicate application
                  </option>
                  <option value="Does not meet quality standards">
                    Does not meet quality standards
                  </option>
                  <option value="Other">Other (please specify in notes)</option>
                </select>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Admin Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any additional notes about this review..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === "approve"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : action === "reject"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
                disabled={loading || !action}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : action === "approve" ? (
                  "Approve Partner"
                ) : action === "reject" ? (
                  "Reject Application"
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>

          {/* Warning Message */}
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-yellow-300 text-xs">
                This action cannot be undone. The partner will be notified of
                your decision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerReviewModal;
