import { useState, useEffect } from "react";
import {
  User,
  Crown,
  Calendar,
  TrendingUp,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import GlassCard from "../UI/GlassCard";
import Badge from "../UI/Badge";
import Button from "../UI/Button";

const UserProfileCard = () => {
  const { session, user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/v1/auth/profile`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProfileData(result.data);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch profile");
        }
      } else {
        setError("Failed to connect to server");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("An error occurred while fetching your profile");
    } finally {
      setLoading(false);
    }
  };

  const generateQrCode = async () => {
    if (!session?.access_token) return;

    try {
      setQrLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/v1/auth/qr-code`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setQrData(result.data);
        }
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [session]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMembershipTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "premium":
        return "text-yellow-300";
      case "member":
        return "text-blue-300";
      case "admin":
        return "text-purple-300";
      default:
        return "text-gray-300";
    }
  };

  const getMembershipTierIcon = (tier) => {
    switch (tier?.toLowerCase()) {
      case "premium":
        return <Crown className="w-5 h-5 text-yellow-300" />;
      case "admin":
        return <Crown className="w-5 h-5 text-purple-300" />;
      default:
        return <User className="w-5 h-5 text-blue-300" />;
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-white/70">Loading profile...</div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <div className="text-red-300 mb-4">{error}</div>
          <Button onClick={fetchUserProfile} variant="primary" size="sm">
            Try Again
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <GlassCard className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-6 md:space-y-0">
          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-royal-gold to-royal-blue rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  {profileData?.fullName || user?.name || "Member"}
                </h2>
                <p className="text-white/70">
                  {profileData?.email || user?.email}
                </p>
              </div>
            </div>

            {/* Membership Status */}
            <div className="flex items-center space-x-3">
              {getMembershipTierIcon(profileData?.role)}
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-semibold ${getMembershipTierColor(
                      profileData?.role
                    )}`}
                  >
                    {profileData?.role?.charAt(0).toUpperCase() +
                      profileData?.role?.slice(1)}{" "}
                    Member
                  </span>
                  {profileData?.membershipStatus?.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="warning">
                      {profileData?.membershipStatus?.isExpired
                        ? "Expired"
                        : "Inactive"}
                    </Badge>
                  )}
                </div>
                {profileData?.membershipStatus?.expiresAt && (
                  <p className="text-sm text-white/60">
                    Expires:{" "}
                    {formatDate(profileData.membershipStatus.expiresAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">
                  {profileData?.redemptionStats?.totalRedemptions || 0}
                </div>
                <div className="text-sm text-white/60">Total Redemptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">
                  PKR {profileData?.redemptionStats?.totalSavings || 0}
                </div>
                <div className="text-sm text-white/60">Total Savings</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/60">
                  Member Since:{" "}
                  {formatDate(profileData?.accountInfo?.memberSince)}
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex-shrink-0 text-center space-y-4">
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
              {qrData ? (
                <div className="text-xs p-2 text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-2 text-royal-blue" />
                  <div className="text-royal-blue font-semibold">
                    User ID: {qrData.displayInfo?.userId?.slice(-8)}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-2" />
                  <div className="text-xs">QR Code</div>
                </div>
              )}
            </div>
            <Button
              onClick={generateQrCode}
              variant="secondary"
              size="sm"
              disabled={qrLoading}
              className="w-full"
            >
              {qrLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  {qrData ? "Refresh QR" : "Generate QR"}
                </>
              )}
            </Button>
            <p className="text-xs text-white/50 max-w-32">
              Show this QR code to partners for quick deal redemption
            </p>
          </div>
        </div>

        {/* User ID Display */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 mb-1">Your User ID</p>
              <p className="font-mono text-white text-sm bg-white/10 px-3 py-1 rounded">
                {profileData?.id || "Loading..."}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60 mb-1">Last Activity</p>
              <p className="text-sm text-white">
                {profileData?.redemptionStats?.lastRedemption
                  ? formatDate(profileData.redemptionStats.lastRedemption)
                  : "No redemptions yet"}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default UserProfileCard;
