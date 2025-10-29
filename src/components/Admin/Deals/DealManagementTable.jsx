import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import DealEditModal from "./DealEditModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DealManagementTable = () => {
  const { session } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'draft', 'expired', 'paused'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [currentView, setCurrentView] = useState("active"); // 'active', 'all', 'draft', 'expired'
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    fetchDeals();
    fetchCategories();
  }, [session]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/deals/admin/all`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setDeals(data.data);
      } else {
        setError(data.error || "Failed to fetch deals");
      }
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/deals/admin/categories`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleDeleteDeal = async (dealId, dealTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete "${dealTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/deals/admin/${dealId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setDeals((prev) => prev.filter((deal) => deal.id !== dealId));
        alert("Deal deleted successfully");
      } else {
        alert(data.error || "Failed to delete deal");
      }
    } catch (err) {
      console.error("Error deleting deal:", err);
      alert("Failed to delete deal");
    }
  };

  const handleToggleStatus = async (dealId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";

    try {
      const response = await fetch(`${API_URL}/api/v1/deals/admin/${dealId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setDeals((prev) =>
          prev.map((deal) =>
            deal.id === dealId ? { ...deal, status: newStatus } : deal
          )
        );
      } else {
        alert(data.error || "Failed to update deal status");
      }
    } catch (err) {
      console.error("Error updating deal status:", err);
      alert("Failed to update deal status");
    }
  };

  const handleToggleFeatured = async (dealId, currentFeatured) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/deals/admin/${dealId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_featured: !currentFeatured }),
      });

      const data = await response.json();
      if (data.success) {
        setDeals((prev) =>
          prev.map((deal) =>
            deal.id === dealId
              ? { ...deal, isFeatured: !currentFeatured }
              : deal
          )
        );
      } else {
        alert(data.error || "Failed to toggle featured status");
      }
    } catch (err) {
      console.error("Error toggling featured status:", err);
      alert("Failed to toggle featured status");
    }
  };

  const handleCreateDeal = () => {
    setSelectedDeal(null);
    setShowEditModal(true);
  };

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setShowEditModal(true);
  };

  const handleDealUpdated = (updatedDeal) => {
    if (selectedDeal) {
      // Update existing deal
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === updatedDeal.id ? { ...deal, ...updatedDeal } : deal
        )
      );
    } else {
      // Add new deal
      fetchDeals(); // Refresh the entire list to get properly formatted data
    }
    setShowEditModal(false);
    setSelectedDeal(null);
  };

  // Filter deals based on current view and search
  const filteredDeals = deals.filter((deal) => {
    const matchesView =
      currentView === "all" ||
      (currentView === "active" && deal.status === "active" && deal.isActive) ||
      (currentView === "draft" && deal.status === "draft") ||
      (currentView === "expired" &&
        (deal.status === "expired" || !deal.isActive));

    const matchesSearch =
      searchTerm === "" ||
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || deal.categoryId === categoryFilter;

    return matchesView && matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status, isActive) => {
    if (status === "active" && isActive) {
      return "bg-green-500/20 text-green-300 border-green-500/50";
    } else if (status === "active" && !isActive) {
      return "bg-orange-500/20 text-orange-300 border-orange-500/50";
    } else if (status === "paused") {
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
    } else if (status === "draft") {
      return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    } else {
      return "bg-red-500/20 text-red-300 border-red-500/50";
    }
  };

  const getStatusText = (status, isActive) => {
    if (status === "active" && isActive) {
      return "Active";
    } else if (status === "active" && !isActive) {
      return "Expired";
    } else if (status === "paused") {
      return "Paused";
    } else if (status === "draft") {
      return "Draft";
    } else {
      return "Inactive";
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">Loading deals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="text-center text-red-300">
          <p className="text-lg font-semibold mb-2">Error Loading Deals</p>
          <p>{error}</p>
          <button
            onClick={fetchDeals}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Deal Management
            </h2>
            <p className="text-gray-300">
              Manage and monitor all platform deals
            </p>
          </div>
          <button
            onClick={handleCreateDeal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Create New Deal
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            {
              key: "active",
              label: "Active Deals",
              count: deals.filter((d) => d.status === "active" && d.isActive)
                .length,
            },
            { key: "all", label: "All Deals", count: deals.length },
            {
              key: "draft",
              label: "Draft",
              count: deals.filter((d) => d.status === "draft").length,
            },
            {
              key: "expired",
              label: "Expired",
              count: deals.filter((d) => !d.isActive || d.status === "expired")
                .length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentView(tab.key)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === tab.key
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-white/70">
            <span>Showing {filteredDeals.length} deals</span>
            <button
              onClick={fetchDeals}
              className="text-indigo-400 hover:text-indigo-300"
              title="Refresh"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left p-4 text-white font-semibold">Deal</th>
                <th className="text-left p-4 text-white font-semibold">
                  Partner
                </th>
                <th className="text-left p-4 text-white font-semibold">
                  Category
                </th>
                <th className="text-left p-4 text-white font-semibold">
                  Discount
                </th>
                <th className="text-left p-4 text-white font-semibold">
                  Period
                </th>
                <th className="text-left p-4 text-white font-semibold">
                  Status
                </th>
                <th className="text-left p-4 text-white font-semibold">
                  Performance
                </th>
                <th className="text-left p-4 text-white font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-gray-400">
                    {searchTerm || categoryFilter !== "all"
                      ? "No deals found matching your filters"
                      : "No deals found"}
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-start space-x-3">
                        {deal.imageUrl && (
                          <img
                            src={deal.imageUrl}
                            alt={deal.title}
                            className="w-12 h-12 rounded-lg object-cover bg-white/20"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-white">
                            {deal.title}
                          </h3>
                          <p className="text-sm text-gray-400 truncate max-w-xs">
                            {deal.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {deal.isFeatured && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                                Featured
                              </span>
                            )}
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                              {deal.tier}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{deal.brand}</div>
                      <div className="text-sm text-gray-400">
                        {deal.location}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{deal.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-green-400">
                        {deal.discount}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="text-white">
                          {new Date(deal.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">
                          to {new Date(deal.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                          deal.status,
                          deal.isActive
                        )}`}
                      >
                        {getStatusText(deal.status, deal.isActive)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="text-white">
                          {deal.currentRedemptions || 0} /{" "}
                          {deal.maxRedemptions || "∞"}
                        </div>
                        <div className="text-gray-400">redeemed</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(deal.id, deal.status)
                          }
                          disabled={deal.status === "draft" || !deal.isActive}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            deal.status === "active"
                              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={
                            deal.status === "active"
                              ? "Pause Deal"
                              : "Activate Deal"
                          }
                        >
                          {deal.status === "active" ? "Pause" : "Activate"}
                        </button>
                        <button
                          onClick={() =>
                            handleToggleFeatured(deal.id, deal.isFeatured)
                          }
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            deal.isFeatured
                              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                              : "bg-gray-600 hover:bg-gray-700 text-white"
                          }`}
                          title={
                            deal.isFeatured
                              ? "Remove from Featured"
                              : "Add to Featured"
                          }
                        >
                          {deal.isFeatured ? "★" : "☆"}
                        </button>
                        <button
                          onClick={() => handleEditDeal(deal)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                          title="Edit Deal"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.id, deal.title)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          title="Delete Deal"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deal Edit Modal */}
      {showEditModal && (
        <DealEditModal
          deal={selectedDeal}
          categories={categories}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDeal(null);
          }}
          onDealUpdated={handleDealUpdated}
        />
      )}
    </div>
  );
};

export default DealManagementTable;
