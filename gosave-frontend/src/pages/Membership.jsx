import { useState, useEffect } from "react";
import { Check, Crown, Star, Zap } from "lucide-react";
import Container from "../components/UI/Container";
import GlassCard from "../components/UI/GlassCard";
import Badge from "../components/UI/Badge";
import Button from "../components/UI/Button";

const Membership = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch membership plans from API
    // Placeholder data for now
    setTimeout(() => {
      setPlans([
        {
          id: 1,
          name: "Basic",
          price: 999,
          duration: 12,
          description:
            "Perfect for occasional savers who want access to local deals",
          features: [
            "Access to basic tier deals",
            "Local partner discounts up to 25%",
            "Mobile app access",
            "Email support",
            "Monthly deal newsletter",
            "Basic member badge",
          ],
          icon: Zap,
          popular: false,
        },
        {
          id: 2,
          name: "Premium",
          price: 1999,
          duration: 12,
          description:
            "Best value for frequent savers with exclusive premium benefits",
          features: [
            "Access to ALL deals (basic + premium)",
            "Higher discount rates up to 50%",
            "Priority customer support",
            "Exclusive premium-only offers",
            "Early access to new deals",
            "Premium member badge",
            "Quarterly exclusive events",
            "Referral bonuses",
          ],
          icon: Crown,
          popular: true,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="text-xl text-white">Loading membership plans...</div>
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
              Choose Your Plan
            </h1>
            <p className="text-xl text-white/80 font-light leading-relaxed">
              Start saving with exclusive deals from local businesses
            </p>
          </div>

          {/* Pricing Cards - Minimalistic */}
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <GlassCard
                  key={plan.id}
                  className={`p-12 text-center ${
                    plan.popular ? "ring-2 ring-royal-gold" : ""
                  }`}
                >
                  <div className="space-y-8">
                    {/* Plan Icon */}
                    <div className="flex justify-center">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${
                          plan.popular ? "bg-royal-gold" : "bg-white/20"
                        }`}
                      >
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    {/* Plan Details */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-display font-bold text-white">
                        {plan.name}
                      </h3>

                      <div className="space-y-2">
                        <div className="text-4xl font-bold text-white">
                          PKR {plan.price.toLocaleString()}
                        </div>
                        <div className="text-white/70">
                          {plan.duration} months
                        </div>
                      </div>

                      <p className="text-white/80 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Key Features - Simplified */}
                    <div className="space-y-3">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center space-x-2"
                        >
                          <Check className="h-4 w-4 text-royal-gold" />
                          <span className="text-white/80 text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.popular ? "primary" : "secondary"}
                    >
                      Choose {plan.name}
                    </Button>

                    {/* Value Proposition */}
                    <p className="text-white/60 text-sm">
                      {plan.name === "Premium"
                        ? "Save up to PKR 10,000+ per year"
                        : "Save up to PKR 5,000+ per year"}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Simple Trust Indicators */}
          <div className="text-center">
            <GlassCard className="p-8 max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-2xl font-bold text-white mb-1">100+</div>
                  <div className="text-white/70 text-sm">Partners</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    5000+
                  </div>
                  <div className="text-white/70 text-sm">Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    PKR 2M+
                  </div>
                  <div className="text-white/70 text-sm">Saved</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Membership;
