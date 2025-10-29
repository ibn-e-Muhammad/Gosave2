import { useState, useEffect } from "react";
import { MapPin, Calendar, Percent } from "lucide-react";
import Container from "../components/UI/Container";
import GlassCard from "../components/UI/GlassCard";
import Badge from "../components/UI/Badge";
import Button from "../components/UI/Button";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${API_URL}/api/v1/deals`);

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDeals(result.data);
          } else {
            console.error("API returned error:", result.error);
            setDeals([]);
          }
        } else {
          console.error(
            "Failed to fetch deals:",
            response.status,
            response.statusText
          );
          setDeals([]);
        }
      } catch (error) {
        console.error("Error fetching deals:", error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="text-xl text-white">Loading deals...</div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light">
      <Container>
        <div className="py-16 space-y-16">
          {/* Header - Minimalistic */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Exclusive Deals
            </h1>
            <p className="text-xl text-white/80 font-light leading-relaxed">
              Discover amazing discounts from trusted local partners
            </p>
          </div>

          {/* Simple Filter */}
          <div className="flex justify-center">
            <GlassCard className="p-6">
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="premium">All Deals</Badge>
                <Badge variant="basic">Basic</Badge>
                <Badge variant="info">Premium</Badge>
              </div>
            </GlassCard>
          </div>

          {/* Deals List - Horizontal Layout */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {deals.map((deal) => (
                <GlassCard
                  key={deal.id}
                  className="overflow-hidden hover"
                  hover
                >
                  {/* Horizontal Card Layout */}
                  <div className="flex flex-col md:flex-row">
                    {/* Left Section - Brand Picture */}
                    <div className="w-full md:w-48 h-48 bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <span className="text-blue-400 text-sm font-bold">
                            {deal.brand?.charAt(0) || "B"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Deal Information */}
                    <div className="flex-1 p-6 space-y-4">
                      {/* Brand Name - Main Heading */}
                      <h3 className="text-xl font-display font-bold text-white">
                        {deal.brand}
                      </h3>

                      {/* Business Type - Subheading */}
                      <p className="text-white/70 text-sm font-medium">
                        {deal.category}
                      </p>

                      {/* Deal Title */}
                      <p className="text-white/90 font-semibold">
                        {deal.title}
                      </p>

                      {/* Membership Tags */}
                      <div className="flex gap-2 flex-wrap">
                        {deal.basic_discount && (
                          <Badge variant="basic">
                            Basic: {deal.basic_discount}%
                          </Badge>
                        )}
                        {deal.premium_discount && (
                          <Badge variant="premium">
                            Premium: {deal.premium_discount}%
                          </Badge>
                        )}
                        {!deal.basic_discount && !deal.premium_discount && (
                          <Badge variant="info">{deal.discount}</Badge>
                        )}
                      </div>

                      {/* Location */}
                      <p className="text-white/60 text-sm">
                        {deal.location}, {deal.city}
                      </p>

                      {/* Valid Till Date */}
                      <p className="text-white/50 text-xs">
                        Valid till{" "}
                        {new Date(deal.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
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

export default Deals;
