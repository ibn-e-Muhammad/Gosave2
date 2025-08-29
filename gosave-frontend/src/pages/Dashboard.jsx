import { useState, useEffect } from "react";
import { Calendar, Gift, Crown, User, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Container from "../components/UI/Container";
import GlassCard from "../components/UI/GlassCard";
import Badge from "../components/UI/Badge";
import Button from "../components/UI/Button";

const Dashboard = () => {
  const { user, session } = useAuth();
  const [membershipInfo, setMembershipInfo] = useState(null);
  const [availableDeals, setAvailableDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

        // Fetch user-specific deals
        const dealsResponse = await fetch(`${API_URL}/api/v1/deals/my-deals`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (dealsResponse.ok) {
          const dealsResult = await dealsResponse.json();
          if (dealsResult.success) {
            setAvailableDeals(dealsResult.data);
          } else {
            console.error("Failed to fetch user deals:", dealsResult.error);
            setAvailableDeals([]);
          }
        } else {
          console.error("Failed to fetch user deals:", dealsResponse.status);
          setAvailableDeals([]);
        }

        // Set membership info from user context
        if (user?.membership) {
          setMembershipInfo({
            plan: user.membership.name,
            validUntil: user.membership.valid_until,
            status:
              new Date(user.membership.valid_until) > new Date()
                ? "active"
                : "expired",
          });
        } else {
          setMembershipInfo({
            plan: "No Membership",
            validUntil: null,
            status: "inactive",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAvailableDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <div className="text-xl text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light">
      <Container>
        <div className="py-16 space-y-16">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Welcome Back, {user?.name || "Member"}
            </h1>
            <p className="text-xl text-white/80 font-light">
              Your savings journey continues
            </p>
          </div>

          {/* Membership Status - Minimalistic */}
          <GlassCard className="p-12 text-center max-w-2xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">
                  {membershipInfo?.plan} Member
                </h2>
                <p className="text-white/70">
                  Active until {membershipInfo?.validUntil}
                </p>
              </div>

              <div className="flex justify-center items-center space-x-8 text-white/60">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-sm">Deals Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">PKR 3,500</div>
                  <div className="text-sm">Total Saved</div>
                </div>
              </div>

              <Button size="lg" className="px-8">
                Explore New Deals
              </Button>
            </div>
          </GlassCard>

          {/* Recent Deals - Simplified */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-white text-center mb-12">
              Your Recent Deals
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {availableDeals.slice(0, 4).map((deal) => (
                <GlassCard key={deal.id} className="p-6 hover" hover>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white text-lg">
                          {deal.title}
                        </h3>
                        <p className="text-white/70">{deal.brand}</p>
                      </div>
                      <span className="text-royal-gold font-bold text-xl">
                        {deal.discount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">
                        Valid until {deal.validUntil}
                      </span>
                      <Button variant="ghost" size="sm">
                        Use Deal
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
