import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import PartnerReviewModal from "./PartnerReviewModal";
import PartnerEditModal from "./PartnerEditModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PartnerApprovalQueue = () => {
  const { session } = useAuth();
  const [pendingPartners, setPendingPartners] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentView, setCurrentView] = useState("pending"); // 'pending', 'all', 'approved', 'rejected'

  const fetchPendingPartners = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/partners/pending`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setPendingPartners(data.data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch pending partners");
      }
    } catch (err) {
      console.error("Error fetching pending partners:", err);
      setError("Failed to connect to server");
    }
  };

  const fetchAllPartners = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/partners/all`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setAllPartners(data.data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch all partners");
      }
    } catch (err) {
      console.error("Error fetching all partners:", err);
      setError("Failed to connect to server");
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      setLoading(true);
      Promise.all([fetchPendingPartners(), fetchAllPartners()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session?.access_token]);

  const handleApprove = async (partnerId, notes = "") => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/partners/${partnerId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove from pending list
        setPendingPartners((prev) => prev.filter((p) => p.id !== partnerId));
        // Refresh all partners list
        await fetchAllPartners();
        setShowReviewModal(false);
        setSelectedPartner(null);
      } else {
        alert("Failed to approve partner: " + data.error);
      }
    } catch (err) {
      console.error("Error approving partner:", err);
      alert("Failed to approve partner");
    }
  };

  const handleReject = async (partnerId, reason, notes = "") => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/partners/${partnerId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason, notes }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove from pending list
        setPendingPartners((prev) => prev.filter((p) => p.id !== partnerId));
        // Refresh all partners list
        await fetchAllPartners();
        setShowReviewModal(false);
        setSelectedPartner(null);
      } else {
        alert("Failed to reject partner: " + data.error);
      }
    } catch (err) {
      console.error("Error rejecting partner:", err);
      alert("Failed to reject partner");
    }
  };

  const handleEdit = (partner) => {
    setSelectedPartner(partner);
    setShowEditModal(true);
  };

  const handleReview = (partner) => {
    setSelectedPartner(partner);
    setShowReviewModal(true);
  };

  const handlePartnerUpdated = (updatedPartner) => {
    // Update in both lists
    setPendingPartners((prev) =>
      prev.map((p) =>
        p.id === updatedPartner.id ? { ...p, ...updatedPartner } : p
      )
    );
    setAllPartners((prev) =>
      prev.map((p) =>
        p.id === updatedPartner.id ? { ...p, ...updatedPartner } : p
      )
    );
    setShowEditModal(false);
    setSelectedPartner(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getFilteredPartners = () => {
    switch (currentView) {
      case "pending":
        return pendingPartners;
      case "approved":
        return allPartners.filter((p) => p.status === "approved");
      case "rejected":
        return allPartners.filter((p) => p.status === "rejected");
      case "all":
      default:
        return allPartners;
    }
  };

  const currentPartners = getFilteredPartners();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-yellow-400">
                {pendingPartners.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Approved</p>
              <p className="text-3xl font-bold text-green-400">
                {allPartners.filter((p) => p.status === "approved").length}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-full">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Rejected</p>
              <p className="text-3xl font-bold text-red-400">
                {allPartners.filter((p) => p.status === "rejected").length}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-full">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">
                Total Partners
              </p>
              <p className="text-3xl font-bold text-white">
                {allPartners.length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-full">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* View Filter Tabs */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex space-x-4 mb-6">
          {[
            {
              key: "pending",
              label: "Pending Review",
              count: pendingPartners.length,
            },
            {
              key: "approved",
              label: "Approved",
              count: allPartners.filter((p) => p.status === "approved").length,
            },
            {
              key: "rejected",
              label: "Rejected",
              count: allPartners.filter((p) => p.status === "rejected").length,
            },
            { key: "all", label: "All Partners", count: allPartners.length },
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setCurrentView(view.key)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === view.key
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {view.label} ({view.count})
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Partners Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Business Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Discount Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentPartners.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    {currentView === "pending"
                      ? "No pending partners"
                      : `No ${currentView} partners`}
                  </td>
                </tr>
              ) : (
                currentPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {partner.brandName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {partner.ownerName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {partner.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {partner.businessType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {partner.city}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {partner.discountRange}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                          partner.status
                        )}`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {partner.status === "pending" ? (
                          <button
                            onClick={() => handleReview(partner)}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(partner)}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedPartner && (
        <PartnerReviewModal
          partner={selectedPartner}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedPartner(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPartner && (
        <PartnerEditModal
          partner={selectedPartner}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPartner(null);
          }}
          onPartnerUpdated={handlePartnerUpdated}
        />
      )}
    </div>
  );
};

export default PartnerApprovalQueue;
