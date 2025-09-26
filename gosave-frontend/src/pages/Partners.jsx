import { useState, useEffect } from "react";
import Container from "../components/UI/Container";
import GlassCard from "../components/UI/GlassCard";
import Button from "../components/UI/Button";
import PartnerRegistrationModal from "../components/Partner/PartnerRegistrationModal";
import ApplicationStatusChecker from "../components/Partner/ApplicationStatusChecker";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showStatusChecker, setShowStatusChecker] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${API_URL}/api/v1/partners`);

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setPartners(result.data);
          } else {
            console.error("API returned error:", result.error);
            setPartners([]);
          }
        } else {
          console.error(
            "Failed to fetch partners:",
            response.status,
            response.statusText
          );
          setPartners([]);
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <div className="text-xl text-white">Loading partners...</div>
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
              Our Partners
            </h1>
            <p className="text-xl text-white/80 font-light leading-relaxed">
              Trusted local businesses offering exclusive deals to GoSave
              members
            </p>
          </div>

          {/* Partners Grid - Simplified */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner) => (
                <GlassCard
                  key={partner.id}
                  className="p-8 text-center hover"
                  hover
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center mx-auto">
                      <span className="text-white font-bold text-xl">
                        {partner.brandName.charAt(0)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-display font-bold text-white">
                        {partner.brandName}
                      </h3>
                      <p className="text-white/70">{partner.businessType}</p>
                      <p className="text-white/60 text-sm">{partner.city}</p>
                    </div>

                    <div className="text-royal-gold font-bold text-lg">
                      {partner.discountRange} OFF
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* CTA Section - Enhanced */}
          <div className="text-center">
            <GlassCard className="p-12 max-w-2xl mx-auto">
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-white">
                  Become a Partner
                </h2>
                <p className="text-white/80 leading-relaxed">
                  Join our network and reach more customers with GoSave
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="px-8"
                    onClick={() => setShowRegistrationModal(true)}
                  >
                    Register as Partner
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8"
                    onClick={() => setShowStatusChecker(true)}
                  >
                    Check Application Status
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </Container>

      {/* Modals */}
      <PartnerRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
      />

      {showStatusChecker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowStatusChecker(false)}
                className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors bg-black/20 rounded-full p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <ApplicationStatusChecker />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
