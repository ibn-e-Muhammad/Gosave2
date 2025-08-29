import { useState, useEffect } from "react";
import { Users, Store, Gift, DollarSign } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Container from "../../components/UI/Container";
import GlassCard from "../../components/UI/GlassCard";
import Button from "../../components/UI/Button";

const AdminDashboard = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

        // Fetch real statistics from multiple endpoints
        const [partnersRes, dealsRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/partners/all`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${API_URL}/api/v1/deals`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        const partnersData = partnersRes.ok
          ? await partnersRes.json()
          : { success: false };
        const dealsData = dealsRes.ok
          ? await dealsRes.json()
          : { success: false };

        setStats({
          totalUsers: 9, // From our populated data - could be fetched from a users endpoint
          totalPartners: partnersData.success ? partnersData.count : 0,
          totalDeals: dealsData.success ? dealsData.count : 0,
          totalRevenue: 45000, // This would need a separate revenue endpoint
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        setStats({
          totalUsers: 0,
          totalPartners: 0,
          totalDeals: 0,
          totalRevenue: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <div className="text-xl text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light">
      <Container>
        <div className="py-16 space-y-16">
          {/* Header - Minimalistic */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-white/80 font-light">
              Platform overview and management
            </p>
          </div>

          {/* Stats Grid - Clean Design */}
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <GlassCard className="p-8 text-center">
              <div className="space-y-3">
                <Users className="w-8 h-8 text-royal-gold mx-auto" />
                <div className="text-3xl font-bold text-white">
                  {stats.totalUsers}
                </div>
                <div className="text-white/70">Total Users</div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 text-center">
              <div className="space-y-3">
                <Store className="w-8 h-8 text-royal-gold mx-auto" />
                <div className="text-3xl font-bold text-white">
                  {stats.totalPartners}
                </div>
                <div className="text-white/70">Partners</div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 text-center">
              <div className="space-y-3">
                <Gift className="w-8 h-8 text-royal-gold mx-auto" />
                <div className="text-3xl font-bold text-white">
                  {stats.totalDeals}
                </div>
                <div className="text-white/70">Active Deals</div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 text-center">
              <div className="space-y-3">
                <DollarSign className="w-8 h-8 text-royal-gold mx-auto" />
                <div className="text-3xl font-bold text-white">
                  PKR {stats.totalRevenue?.toLocaleString()}
                </div>
                <div className="text-white/70">Revenue</div>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions - Simplified */}
          <div className="text-center">
            <GlassCard className="p-12 max-w-2xl mx-auto">
              <div className="space-y-8">
                <h2 className="text-2xl font-display font-bold text-white">
                  Quick Actions
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg">Manage Users</Button>
                  <Button variant="ghost" size="lg">
                    Approve Partners
                  </Button>
                  <Button variant="ghost" size="lg">
                    Create Deal
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboard;
