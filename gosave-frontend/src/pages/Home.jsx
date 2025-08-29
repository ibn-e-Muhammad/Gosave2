import { Link } from "react-router-dom";
import { ArrowRight, Shield, Users, Gift, Quote, User } from "lucide-react";
import { useState, useEffect } from "react";
import Container from "../components/UI/Container";
import GlassCard from "../components/UI/GlassCard";
import Button from "../components/UI/Button";

const Home = () => {
  // Carousel state for testimonials
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: Gift,
      title: "Exclusive Deals",
      description:
        "Access member-only discounts at your favorite local businesses",
    },
    {
      icon: Shield,
      title: "Trusted Partners",
      description: "Verified local businesses committed to quality and service",
    },
    {
      icon: Users,
      title: "Community Focused",
      description:
        "Supporting local economy while saving money for our members",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Ahmed",
      role: "Premium Member",
      content:
        "I've saved over PKR 15,000 in just 3 months! The local deals are amazing.",
      rating: 5,
    },
    {
      name: "Ali Hassan",
      role: "Basic Member",
      content: "Great way to discover new local businesses while saving money.",
      rating: 5,
    },
    {
      name: "Fatima Khan",
      role: "Premium Member",
      content: "The premium membership pays for itself. Highly recommended!",
      rating: 5,
    },
  ];

  // Auto-play carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light">
      {/* Hero Section - Minimalistic Design */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <Container>
          <div className="text-center max-w-4xl mx-auto space-y-12">
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight tracking-tight">
                Save More.
                <br />
                <span className="text-royal-gold">Live Better.</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto font-light">
                Unlock exclusive discounts at local businesses across Pakistan
                with GoSave membership.
              </p>
            </div>

            {/* Single Primary CTA */}
            <div className="flex justify-center">
              <Button
                size="lg"
                className="group px-12 py-4 text-lg font-semibold"
              >
                Start Saving Today
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Minimal Trust Indicators */}
            <div className="flex justify-center items-center space-x-12 text-white/60 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-royal-gold rounded-full"></div>
                <span>100+ Partners</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-royal-gold rounded-full"></div>
                <span>5000+ Members</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-royal-gold rounded-full"></div>
                <span>PKR 2M+ Saved</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-h2 font-display font-bold text-white mb-4">
              Why Choose GoSave?
            </h2>
            <p className="text-xl text-neutral-grey max-w-2xl mx-auto">
              We're more than just a discount platform. We're building a
              community that supports local businesses while helping you save
              money.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={index} className="p-8 text-center hover" hover>
                  <div className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-h4 font-display font-bold text-neutral-black mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-slate leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="py-32">
        <Container>
          {/* Section Heading */}
          <h2 className="text-4xl font-display font-bold text-white text-center mb-12">
            What Our Loved Users Say
          </h2>

          {/* Carousel Container */}
          <div className="relative max-w-5xl mx-auto ">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    {/* Testimonial Card - Exact Reference Match */}
                    <div className="relative bg-white/20 backdrop-blur-lg  rounded-3xl p-16 mx-auto max-w-4xl min-h-[400px] flex flex-col justify-center shadow-2xl shadow-black/10">
                      {/* Large Quote Icon - Top Left */}
                      <div className="absolute top-8 left-8">
                        <Quote className="h-20 w-20 text-royal-gold fill-royal-gold" />
                      </div>

                      {/* Testimonial Content */}
                      <div className="text-center space-y-12 mt-8">
                        {/* Testimonial Text */}
                        <blockquote>
                          <p className="text-2xl md:text-3xl lg:text-4xl font-decorative text-white leading-relaxed font-normal">
                            {testimonial.content}
                          </p>
                        </blockquote>

                        {/* User Info Section */}
                        <div className="flex flex-col items-center space-y-6">
                          {/* User Avatar */}
                          <div className="w-12 h-12 bg-royal-gold rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>

                          {/* User Details */}
                          <div className="text-center space-y-2">
                            <h4 className="font-spectral font-semibold text-white text-xl">
                              {testimonial.name}
                            </h4>
                            <p className="font-spectral text-neutral-grey text-base">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-12 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-royal-gold scale-110"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Container>
          <GlassCard className="p-12 text-center">
            <h2 className="text-h2 font-display font-bold text-neutral-black mb-4">
              Ready to Start Saving?
            </h2>
            <p className="text-xl text-neutral-slate mb-8 max-w-2xl mx-auto">
              Join thousands of smart savers and start discovering amazing deals
              at your favorite local businesses today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/membership">
                <Button size="lg">Choose Your Plan</Button>
              </Link>
              <Link to="/deals">
                <Button variant="ghost" size="lg">
                  Browse Deals
                </Button>
              </Link>
            </div>
          </GlassCard>
        </Container>
      </section>
    </div>
  );
};

export default Home;
