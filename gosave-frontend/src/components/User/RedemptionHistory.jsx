import { useState, useEffect } from "react";
import { Clock, MapPin, CreditCard, FileText, QrCode } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import GlassCard from "../UI/GlassCard";
import Badge from "../UI/Badge";
import Button from "../UI/Button";

const RedemptionHistory = () => {
  const { session } = useAuth();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchRedemptions = async (pageNum = 1) => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(
        `${API_URL}/api/v1/deals/redemptions/my-history?page=${pageNum}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRedemptions(result.data);
          setPagination(result.pagination);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch redemption history");
        }
      } else {
        setError("Failed to connect to server");
      }
    } catch (err) {
      console.error("Error fetching redemptions:", err);
      setError("An error occurred while fetching your redemption history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions(page);
  }, [session, page]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return `PKR ${parseFloat(amount).toFixed(2)}`;
  };

  const getRedemptionMethodIcon = (method) => {
    switch (method) {
      case "qr_code":
        return <QrCode className="w-4 h-4" />;
      case "manual":
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getRedemptionMethodLabel = (method) => {
    switch (method) {
      case "qr_code":
        return "QR Code";
      case "manual":
      default:
        return "Manual";
    }
  };

  if (loading && redemptions.length === 0) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-white/70">Loading redemption history...</div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <div className="text-red-300 mb-4">{error}</div>
          <Button
            onClick={() => fetchRedemptions(page)}
            variant="primary"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white">
          Redemption History
        </h2>
        {pagination && (
          <div className="text-sm text-white/70">
            {pagination.total} total redemptions
          </div>
        )}
      </div>

      {redemptions.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-white/50" />
            </div>
            <div className="text-white/70">
              <p className="text-lg mb-2">No redemptions yet</p>
              <p className="text-sm">
                Start saving money by redeeming deals with our partners!
              </p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {redemptions.map((redemption) => (
            <GlassCard key={redemption.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                {/* Deal Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {redemption.deals?.deal_title || "Unknown Deal"}
                      </h3>
                      <p className="text-sm text-white/70">
                        {redemption.partners?.brand_name || "Unknown Partner"}
                      </p>
                    </div>
                    <Badge variant="success">Redeemed</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(redemption.redeemed_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      {getRedemptionMethodIcon(redemption.redemption_method)}
                      {getRedemptionMethodLabel(redemption.redemption_method)}
                    </div>
                    {redemption.redemption_code && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Code: {redemption.redemption_code}
                      </div>
                    )}
                  </div>
                </div>

                {/* Savings Info */}
                <div className="flex-shrink-0 text-right space-y-1">
                  {redemption.discount_amount && (
                    <div className="text-lg font-semibold text-green-300">
                      Saved: {formatCurrency(redemption.discount_amount)}
                    </div>
                  )}
                  {redemption.original_amount && (
                    <div className="text-sm text-white/60">
                      Original: {formatCurrency(redemption.original_amount)}
                    </div>
                  )}
                  {redemption.final_amount && (
                    <div className="text-sm text-white/60">
                      Paid: {formatCurrency(redemption.final_amount)}
                    </div>
                  )}
                </div>
              </div>

              {redemption.notes && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/70">
                    <strong>Note:</strong> {redemption.notes}
                  </p>
                </div>
              )}
            </GlassCard>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                variant="secondary"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-white/70 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RedemptionHistory;
