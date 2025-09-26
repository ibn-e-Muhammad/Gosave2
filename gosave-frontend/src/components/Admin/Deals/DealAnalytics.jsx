import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DealAnalytics = ({ dealId = null }) => {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState({
    analytics: [],
    summary: {
      total_views: 0,
      total_clicks: 0,
      total_redeems: 0,
      total_saves: 0,
      unique_users: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days ago
    end_date: new Date().toISOString().split("T")[0], // today
  });

  useEffect(() => {
    fetchAnalytics();
  }, [session, dealId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        ...(dealId && { deal_id: dealId }),
      });

      const response = await fetch(
        `${API_URL}/api/v1/deals/admin/analytics?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || "Failed to fetch analytics");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getEngagementRate = () => {
    if (analytics.summary.total_views === 0) return 0;
    return (
      (analytics.summary.total_clicks / analytics.summary.total_views) *
      100
    ).toFixed(1);
  };

  const getConversionRate = () => {
    if (analytics.summary.total_clicks === 0) return 0;
    return (
      (analytics.summary.total_redeems / analytics.summary.total_clicks) *
      100
    ).toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="text-center text-red-300">
          <p className="text-lg font-semibold mb-2">Error Loading Analytics</p>
          <p>{error}</p>
          <button
            onClick={fetchAnalytics}
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
      {/* Header and Date Range Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {dealId ? "Deal Analytics" : "Deal Performance Overview"}
            </h2>
            <p className="text-gray-300">
              Track deal performance and user engagement
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">From:</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => handleDateChange("start_date", e.target.value)}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">To:</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => handleDateChange("end_date", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {analytics.summary.total_views.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
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
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {analytics.summary.total_clicks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Clicks</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-400"
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
            <div>
              <div className="text-2xl font-bold text-white">
                {analytics.summary.total_redeems.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Redeemed</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {analytics.summary.total_saves.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Saved</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/20 rounded-lg">
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {analytics.summary.unique_users.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Unique Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Engagement Rate
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-green-400">
              {getEngagementRate()}%
            </div>
            <div className="text-sm text-gray-400">
              Clicks per view
              <br />({analytics.summary.total_clicks} clicks /{" "}
              {analytics.summary.total_views} views)
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(parseFloat(getEngagementRate()), 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Conversion Rate
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-purple-400">
              {getConversionRate()}%
            </div>
            <div className="text-sm text-gray-400">
              Redemptions per click
              <br />({analytics.summary.total_redeems} redeemed /{" "}
              {analytics.summary.total_clicks} clicks)
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(parseFloat(getConversionRate()), 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Activity
        </h3>

        {analytics.analytics.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>No activity data available for the selected period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left p-3 text-white font-semibold">
                    Time
                  </th>
                  <th className="text-left p-3 text-white font-semibold">
                    Action
                  </th>
                  <th className="text-left p-3 text-white font-semibold">
                    Deal
                  </th>
                  <th className="text-left p-3 text-white font-semibold">
                    User
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.analytics.slice(0, 20).map((activity, index) => (
                  <tr
                    key={activity.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 text-gray-300">
                      {new Date(activity.createdAt).toLocaleDateString()}{" "}
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.actionType === "view"
                            ? "bg-blue-500/20 text-blue-300"
                            : activity.actionType === "click"
                            ? "bg-green-500/20 text-green-300"
                            : activity.actionType === "redeem"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {activity.actionType}
                      </span>
                    </td>
                    <td className="p-3 text-white">{activity.dealTitle}</td>
                    <td className="p-3 text-gray-300">
                      {activity.userName || "Anonymous"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealAnalytics;
