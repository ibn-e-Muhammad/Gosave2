import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Store,
  Activity,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import Container from "../../UI/Container";
import GlassCard from "../../UI/GlassCard";
import Button from "../../UI/Button";

// Import analytics components
import StatsCards from "./StatsCards";
import RedemptionChart from "./RedemptionChart";
import PartnerPerformanceTable from "./PartnerPerformanceTable";

const AnalyticsDashboard = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    dashboardStats: null,
    redemptionTrends: null,
    partnerPerformance: null,
  });

  const [filters, setFilters] = useState({
    period: "7d",
    startDate: "",
    endDate: "",
  });

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      setError(null);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

      // Fetch all analytics data in parallel
      const [statsResponse, trendsResponse, performanceResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/v1/analytics/dashboard-stats`, { headers }),
          fetch(
            `${API_URL}/api/v1/analytics/redemption-trends?period=${filters.period}`,
            { headers }
          ),
          fetch(
            `${API_URL}/api/v1/analytics/partner-performance?limit=10&sortBy=redemptions`,
            { headers }
          ),
        ]);

      // Check for errors
      if (!statsResponse.ok || !trendsResponse.ok || !performanceResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      // Parse responses
      const [statsData, trendsData, performanceData] = await Promise.all([
        statsResponse.json(),
        trendsResponse.json(),
        performanceResponse.json(),
      ]);

      setAnalyticsData({
        dashboardStats: statsData.success ? statsData.data : null,
        redemptionTrends: trendsData.success ? trendsData : null, // Store complete response with summary
        partnerPerformance: performanceData.success
          ? performanceData.data
          : null,
      });
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [session, filters.period]);

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setFilters((prev) => ({ ...prev, period: newPeriod }));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light">
        <Container>
          <div className="py-16 space-y-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Analytics Dashboard
              </h1>
              <p className="text-xl text-white/80 font-light">
                Loading analytics data...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light">
        <Container>
          <div className="py-16 space-y-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Analytics Dashboard
              </h1>
              <GlassCard className="p-8 text-center">
                <div className="text-red-300 mb-4">
                  <Activity className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Failed to load analytics data</p>
                  <p className="text-sm text-white/70">{error}</p>
                </div>
                <Button onClick={handleRefresh} className="mt-4">
                  Try Again
                </Button>
              </GlassCard>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light">
      <Container>
        <div className="py-16 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-white/80 font-light">
              Comprehensive business insights and performance metrics
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Period Filter */}
            <div className="flex space-x-2">
              {["24h", "7d", "30d", "90d"].map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filters.period === period
                      ? "bg-white text-royal-blue shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {period === "24h"
                    ? "24 Hours"
                    : period === "7d"
                    ? "7 Days"
                    : period === "30d"
                    ? "30 Days"
                    : "90 Days"}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <Button
              onClick={handleRefresh}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Refresh Data</span>
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "overview"
                      ? "bg-white text-royal-blue shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("trends")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "trends"
                      ? "bg-white text-royal-blue shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Trends
                </button>
                <button
                  onClick={() => setActiveTab("partners")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "partners"
                      ? "bg-white text-royal-blue shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Partners
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <StatsCards data={analyticsData.dashboardStats} />

                {/* Quick Overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Activity Summary */}
                  {analyticsData.redemptionTrends && (
                    <GlassCard className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-white">
                          <span>Total Redemptions:</span>
                          <span className="font-bold">
                            {analyticsData.redemptionTrends?.summary
                              ?.totalRedemptions || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-white">
                          <span>Total Savings Given:</span>
                          <span className="font-bold text-green-300">
                            PKR{" "}
                            {(
                              analyticsData.redemptionTrends?.summary
                                ?.totalDiscountGiven || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-white">
                          <span>Avg Daily Redemptions:</span>
                          <span className="font-bold">
                            {analyticsData.redemptionTrends?.summary
                              ?.avgDailyRedemptions || 0}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {/* Top Partner Preview */}
                  {analyticsData.partnerPerformance &&
                    analyticsData.partnerPerformance.length > 0 && (
                      <GlassCard className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                          <Store className="w-5 h-5 mr-2" />
                          Top Performing Partner
                        </h3>
                        {(() => {
                          const topPartner =
                            analyticsData.partnerPerformance[0];
                          return (
                            <div className="space-y-3">
                              <div className="text-white">
                                <p className="font-bold text-lg">
                                  {topPartner.business_name}
                                </p>
                                <p className="text-white/70 text-sm">
                                  {topPartner.contact_email}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-white">
                                  <p className="text-white/70">Redemptions</p>
                                  <p className="font-bold text-green-300">
                                    {topPartner.total_redemptions}
                                  </p>
                                </div>
                                <div className="text-white">
                                  <p className="text-white/70">Savings Given</p>
                                  <p className="font-bold text-green-300">
                                    PKR {topPartner.total_savings}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </GlassCard>
                    )}
                </div>
              </div>
            )}

            {activeTab === "trends" && (
              <div className="space-y-8">
                <RedemptionChart
                  data={analyticsData.redemptionTrends?.data || []}
                />
              </div>
            )}

            {activeTab === "partners" && (
              <div className="space-y-8">
                <PartnerPerformanceTable
                  data={analyticsData.partnerPerformance || []}
                />
              </div>
            )}
          </div>

          {/* Last Updated */}
          {analyticsData.dashboardStats && (
            <div className="text-center">
              <p className="text-white/60 text-sm flex items-center justify-center">
                <Calendar className="w-4 h-4 mr-2" />
                Last updated:{" "}
                {new Date(
                  analyticsData.dashboardStats.lastUpdated
                ).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default AnalyticsDashboard;
