import { useState, useEffect } from "react";
import {
  Search,
  QrCode,
  User,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Container from "../UI/Container";
import GlassCard from "../UI/GlassCard";
import Badge from "../UI/Badge";
import Button from "../UI/Button";

const PartnerDashboard = () => {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState("validate");
  const [userValidation, setUserValidation] = useState({
    userId: "",
    userEmail: "",
    loading: false,
    result: null,
    error: null,
  });
  const [redemption, setRedemption] = useState({
    loading: false,
    error: null,
    success: null,
  });
  const [availableDeals, setAvailableDeals] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);

  // Fetch available deals for partner
  const fetchAvailableDeals = async () => {
    if (!session?.access_token) return;

    try {
      setDealsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(
        `${API_URL}/api/v1/partners/available-deals`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("🔍 Full API Response:", result);
        console.log("🔍 result.data type:", typeof result.data);
        console.log("🔍 result.data isArray:", Array.isArray(result.data));
        console.log("🔍 result.data content:", result.data);

        if (result.success && Array.isArray(result.data)) {
          setAvailableDeals(result.data);
        } else {
          console.error("API response missing data array:", result);
          console.error("Expected array but got:", typeof result.data);
          setAvailableDeals([]);
        }
      } else {
        console.error("API request failed:", response.status);
        setAvailableDeals([]);
      }
    } catch (err) {
      console.error("Error fetching available deals:", err);
      setAvailableDeals([]);
    } finally {
      setDealsLoading(false);
    }
  };

  // Validate user for redemption
  const validateUser = async () => {
    if (!userValidation.userId && !userValidation.userEmail) {
      setUserValidation((prev) => ({
        ...prev,
        error: "Please enter User ID or Email",
      }));
      return;
    }

    try {
      setUserValidation((prev) => ({ ...prev, loading: true, error: null }));
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/v1/partners/validate-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userValidation.userId || undefined,
          userEmail: userValidation.userEmail || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserValidation((prev) => ({
            ...prev,
            result: result.data,
            error: null,
          }));
        } else {
          setUserValidation((prev) => ({
            ...prev,
            result: null,
            error: result.error,
          }));
        }
      } else {
        setUserValidation((prev) => ({
          ...prev,
          result: null,
          error: "Failed to validate user",
        }));
      }
    } catch (err) {
      setUserValidation((prev) => ({
        ...prev,
        result: null,
        error: "An error occurred while validating user",
      }));
    } finally {
      setUserValidation((prev) => ({ ...prev, loading: false }));
    }
  };

  // Process redemption
  const processRedemption = async (
    dealId,
    discountAmount,
    originalAmount,
    notes
  ) => {
    if (!userValidation.result) {
      setRedemption((prev) => ({ ...prev, error: "No user validated" }));
      return;
    }

    try {
      setRedemption({ loading: true, error: null, success: null });
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/v1/deals/${dealId}/redeem`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userValidation.result.id,
          discountAmount: parseFloat(discountAmount),
          originalAmount: parseFloat(originalAmount),
          redemptionMethod: "manual",
          notes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRedemption({
            loading: false,
            error: null,
            success: result.data,
          });
          // Reset user validation to process next customer
          setUserValidation({
            userId: "",
            userEmail: "",
            loading: false,
            result: null,
            error: null,
          });
          // Refresh deals to update counters
          fetchAvailableDeals();
        } else {
          setRedemption({
            loading: false,
            error: result.error,
            success: null,
          });
        }
      }
    } catch (err) {
      setRedemption({
        loading: false,
        error: "An error occurred while processing redemption",
        success: null,
      });
    }
  };

  useEffect(() => {
    if (user?.role === "partner" || user?.role === "admin") {
      fetchAvailableDeals();
    }
  }, [user, session]);

  // Check if user has partner access
  if (user?.role !== "partner" && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <Container>
          <GlassCard className="p-12 text-center">
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-red-300 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Access Denied</h2>
              <p className="text-white/70">
                This dashboard is only available for approved partners.
              </p>
            </div>
          </GlassCard>
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
              Partner Dashboard
            </h1>
            <p className="text-xl text-white/80 font-light">
              Process deal redemptions for your customers
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("validate")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "validate"
                      ? "bg-white text-royal-blue shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  User Validation
                </button>
                <button
                  onClick={() => setActiveTab("deals")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "deals"
                      ? "bg-white text-royal-blue shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Available Deals
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "history"
                      ? "bg-white text-royal-blue shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  History
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-6xl mx-auto">
            {activeTab === "validate" && (
              <UserValidationTab
                userValidation={userValidation}
                setUserValidation={setUserValidation}
                validateUser={validateUser}
                availableDeals={availableDeals}
                processRedemption={processRedemption}
                redemption={redemption}
                setRedemption={setRedemption}
              />
            )}

            {activeTab === "deals" && (
              <AvailableDealsTab
                deals={availableDeals}
                loading={dealsLoading}
              />
            )}

            {activeTab === "history" && (
              <RedemptionHistoryTab session={session} />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

// User Validation Tab Component
const UserValidationTab = ({
  userValidation,
  setUserValidation,
  validateUser,
  availableDeals,
  processRedemption,
  redemption,
  setRedemption,
}) => {
  const [redemptionForm, setRedemptionForm] = useState({
    dealId: "",
    originalAmount: "",
    discountAmount: "",
    notes: "",
  });

  const resetForm = () => {
    setRedemptionForm({
      dealId: "",
      originalAmount: "",
      discountAmount: "",
      notes: "",
    });
    setRedemption({ loading: false, error: null, success: null });
  };

  return (
    <div className="space-y-6">
      {/* User Validation Section */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Validate Customer
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userValidation.userId}
              onChange={(e) =>
                setUserValidation((prev) => ({
                  ...prev,
                  userId: e.target.value,
                  userEmail: "",
                  error: null,
                }))
              }
              placeholder="Enter user ID"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-royal-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              OR Email Address
            </label>
            <input
              type="email"
              value={userValidation.userEmail}
              onChange={(e) =>
                setUserValidation((prev) => ({
                  ...prev,
                  userEmail: e.target.value,
                  userId: "",
                  error: null,
                }))
              }
              placeholder="Enter email address"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-royal-gold focus:border-transparent"
            />
          </div>
        </div>

        <Button
          onClick={validateUser}
          disabled={userValidation.loading}
          className="w-full md:w-auto"
        >
          {userValidation.loading ? "Validating..." : "Validate User"}
        </Button>

        {userValidation.error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-300/30 rounded-lg">
            <p className="text-red-300">{userValidation.error}</p>
          </div>
        )}
      </GlassCard>

      {/* User Details Section */}
      {userValidation.result && (
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Customer Details</h3>
            {userValidation.result.isValidMember ? (
              <Badge variant="success">Valid Member</Badge>
            ) : (
              <Badge variant="warning">
                {userValidation.result.isExpired ? "Expired" : "Invalid"}
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-white/70 text-sm">Name</p>
              <p className="text-white font-medium">
                {userValidation.result.name}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Email</p>
              <p className="text-white font-medium">
                {userValidation.result.email}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Membership Tier</p>
              <p className="text-white font-medium capitalize">
                {userValidation.result.membershipTier}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Membership Expires</p>
              <p className="text-white font-medium">
                {userValidation.result.membershipExpires
                  ? new Date(
                      userValidation.result.membershipExpires
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {userValidation.result.isValidMember && (
            <RedemptionForm
              availableDeals={availableDeals}
              redemptionForm={redemptionForm}
              setRedemptionForm={setRedemptionForm}
              processRedemption={processRedemption}
              redemption={redemption}
              resetForm={resetForm}
            />
          )}
        </GlassCard>
      )}

      {/* Success Message */}
      {redemption.success && (
        <GlassCard className="p-8">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto" />
            <h3 className="text-2xl font-bold text-white">
              Redemption Successful!
            </h3>
            <p className="text-white/70">
              Redemption Code:{" "}
              <span className="font-mono font-bold text-green-300">
                {redemption.success.redemptionCode}
              </span>
            </p>
            <Button onClick={resetForm} variant="secondary">
              Process Next Customer
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// Redemption Form Component
const RedemptionForm = ({
  availableDeals,
  redemptionForm,
  setRedemptionForm,
  processRedemption,
  redemption,
  resetForm,
}) => {
  const selectedDeal = availableDeals.find(
    (deal) => deal.id === redemptionForm.dealId
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    processRedemption(
      redemptionForm.dealId,
      redemptionForm.discountAmount,
      redemptionForm.originalAmount,
      redemptionForm.notes
    );
  };

  return (
    <div className="border-t border-white/10 pt-6">
      <h4 className="text-lg font-bold text-white mb-4">Process Redemption</h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            Select Deal
          </label>
          <select
            value={redemptionForm.dealId}
            onChange={(e) =>
              setRedemptionForm((prev) => ({ ...prev, dealId: e.target.value }))
            }
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-royal-gold focus:border-transparent"
          >
            <option value="">Select a deal</option>
            {Array.isArray(availableDeals) &&
              availableDeals.map((deal) => (
                <option
                  key={deal.id}
                  value={deal.id}
                  className="bg-royal-blue text-white"
                >
                  {deal.title} ({deal.discountRange})
                </option>
              ))}
          </select>
        </div>

        {selectedDeal && (
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/70 text-sm mb-2">Selected Deal Details:</p>
            <p className="text-white font-medium">{selectedDeal.title}</p>
            <p className="text-white/70 text-sm">
              Discount: {selectedDeal.discountRange}
            </p>
            <p className="text-white/70 text-sm">
              Remaining Uses: {selectedDeal.redemptionInfo.remainingUses}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Original Amount (PKR)
            </label>
            <input
              type="number"
              step="0.01"
              value={redemptionForm.originalAmount}
              onChange={(e) =>
                setRedemptionForm((prev) => ({
                  ...prev,
                  originalAmount: e.target.value,
                }))
              }
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-royal-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Discount Amount (PKR)
            </label>
            <input
              type="number"
              step="0.01"
              value={redemptionForm.discountAmount}
              onChange={(e) =>
                setRedemptionForm((prev) => ({
                  ...prev,
                  discountAmount: e.target.value,
                }))
              }
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-royal-gold focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={redemptionForm.notes}
            onChange={(e) =>
              setRedemptionForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-royal-gold focus:border-transparent resize-none"
            placeholder="Add any additional notes..."
          />
        </div>

        {redemption.error && (
          <div className="p-4 bg-red-500/20 border border-red-300/30 rounded-lg">
            <p className="text-red-300">{redemption.error}</p>
          </div>
        )}

        <Button type="submit" disabled={redemption.loading} className="w-full">
          {redemption.loading ? "Processing..." : "Process Redemption"}
        </Button>
      </form>
    </div>
  );
};

// Available Deals Tab Component
const AvailableDealsTab = ({ deals, loading }) => {
  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="text-center text-white/70">
          Loading available deals...
        </div>
      </GlassCard>
    );
  }

  // Check if deals is not an array or is null/undefined
  if (!Array.isArray(deals)) {
    return (
      <GlassCard className="p-12 text-center">
        <div className="space-y-4">
          <TrendingUp className="w-16 h-16 text-white/50 mx-auto" />
          <h3 className="text-xl font-bold text-white">Unable to Load Deals</h3>
          <p className="text-white/70">
            There was an issue loading your deals. Please try refreshing the
            page.
          </p>
        </div>
      </GlassCard>
    );
  }

  if (deals.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <div className="space-y-4">
          <TrendingUp className="w-16 h-16 text-white/50 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Active Deals</h3>
          <p className="text-white/70">
            You don't have any active deals at the moment.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Your Active Deals
        </h2>
        <p className="text-white/70">
          {deals.length} deals available for redemption
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {deals.map((deal) => (
          <GlassCard key={deal.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{deal.title}</h3>
                  <p className="text-white/70 text-sm">{deal.description}</p>
                </div>
                <Badge variant="success">{deal.status}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Discount Range:</span>
                  <span className="text-white font-medium">
                    {deal.discountRange}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Total Redemptions:</span>
                  <span className="text-white font-medium">
                    {deal.redemptionInfo.totalRedemptions}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Remaining Uses:</span>
                  <span className="text-white font-medium">
                    {deal.redemptionInfo.remainingUses}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Valid Until:</span>
                  <span className="text-white font-medium">
                    {new Date(deal.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-white/60 text-xs">
                  {deal.city}, {deal.location}
                </span>
                <span className="text-white/60 text-xs capitalize">
                  {deal.membershipTier} tier
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// Redemption History Tab Component
const RedemptionHistoryTab = ({ session }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.access_token) return;

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

        const response = await fetch(`${API_URL}/api/v1/partners/redemptions`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setHistory(result.data);
          } else {
            console.error("API response missing data array:", result);
            setHistory([]);
          }
        } else {
          console.error("API request failed:", response.status);
          setHistory([]);
        }
      } catch (err) {
        console.error("Error fetching redemption history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session]);

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="text-center text-white/70">
          Loading redemption history...
        </div>
      </GlassCard>
    );
  }

  // Check if history is not an array or is null/undefined
  if (!Array.isArray(history)) {
    return (
      <GlassCard className="p-12 text-center">
        <div className="space-y-4">
          <CheckCircle className="w-16 h-16 text-white/50 mx-auto" />
          <h3 className="text-xl font-bold text-white">
            Unable to Load History
          </h3>
          <p className="text-white/70">
            There was an issue loading your redemption history. Please try
            refreshing the page.
          </p>
        </div>
      </GlassCard>
    );
  }

  if (history.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <div className="space-y-4">
          <CheckCircle className="w-16 h-16 text-white/50 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Redemptions Yet</h3>
          <p className="text-white/70">
            Processed redemptions will appear here.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Redemption History
        </h2>
        <p className="text-white/70">{history.length} redemptions processed</p>
      </div>

      <div className="space-y-4">
        {history.map((redemption) => (
          <GlassCard key={redemption.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  {redemption.deals?.deal_title || "Unknown Deal"}
                </h3>
                <p className="text-white/70">
                  Customer: {redemption.users?.full_name || "Unknown"}
                </p>
                <p className="text-white/60 text-sm">
                  {new Date(redemption.redeemed_at).toLocaleString()}
                </p>
              </div>

              <div className="text-right space-y-1">
                <div className="text-green-300 font-bold">
                  Saved: PKR {redemption.discount_amount || 0}
                </div>
                <div className="text-white/60 text-sm">
                  Code: {redemption.redemption_code}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default PartnerDashboard;
