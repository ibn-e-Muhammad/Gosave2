import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Percent,
  Calendar,
} from "lucide-react";
import Button from "../UI/Button";
import GlassCard from "../UI/GlassCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PartnerRegistrationModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Business Information
    brand_name: "",
    business_type: "",
    description: "",
    website: "",

    // Step 2: Contact Information
    owner_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",

    // Step 3: Partnership Details
    min_discount: "",
    max_discount: "",
    contract_duration_months: "12",
  });

  const businessTypes = [
    "Restaurant",
    "Cafe",
    "Retail Store",
    "Grocery Store",
    "Pharmacy",
    "Electronics",
    "Clothing",
    "Beauty & Spa",
    "Fitness Center",
    "Hotel",
    "Car Service",
    "Home Service",
    "Education",
    "Healthcare",
    "Other",
  ];

  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
    "Gujranwala",
    "Other",
  ];

  const contractDurations = [
    { value: "6", label: "6 Months" },
    { value: "12", label: "1 Year" },
    { value: "24", label: "2 Years" },
    { value: "36", label: "3 Years" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.brand_name && formData.business_type;
      case 2:
        return (
          formData.owner_name &&
          formData.email &&
          formData.phone &&
          formData.address &&
          formData.city
        );
      case 3:
        return true; // All fields in step 3 are optional or have defaults
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError("Please fill all required fields");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError("Please complete all required information");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/partners/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to submit application");
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      brand_name: "",
      business_type: "",
      description: "",
      website: "",
      owner_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      min_discount: "",
      max_discount: "",
      contract_duration_months: "12",
    });
    setCurrentStep(1);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">
                {success ? "Application Submitted!" : "Become a Partner"}
              </h2>
              {!success && (
                <p className="text-white/70 mt-1">
                  Step {currentStep} of 3 - Join our network of trusted partners
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          {!success && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Business Info</span>
                <span className="text-sm text-white/60">Contact Details</span>
                <span className="text-sm text-white/60">Partnership</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-royal-gold to-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Thank You for Your Application!
              </h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Your partner application has been submitted successfully. Our
                team will review it and get back to you within 2-3 business
                days.
              </p>
              <p className="text-royal-gold font-medium mb-8">
                You can check your application status anytime using your email
                address.
              </p>
              <Button onClick={handleClose} size="lg">
                Close
              </Button>
            </div>
          )}

          {/* Form Steps */}
          {!success && (
            <>
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Store className="inline w-4 h-4 mr-2" />
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="brand_name"
                        value={formData.brand_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="e.g., Cafe Delicious"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Business Type *
                      </label>
                      <select
                        name="business_type"
                        value={formData.business_type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold"
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map((type) => (
                          <option
                            key={type}
                            value={type}
                            className="text-black"
                          >
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Globe className="inline w-4 h-4 mr-2" />
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                      placeholder="https://your-website.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent resize-none"
                      placeholder="Tell us about your business..."
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="inline w-4 h-4 mr-2" />
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Mail className="inline w-4 h-4 mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Phone className="inline w-4 h-4 mr-2" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Business Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                      placeholder="Street address, building name/number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold"
                    >
                      <option value="">Select city</option>
                      {cities.map((city) => (
                        <option key={city} value={city} className="text-black">
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Partnership Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Percent className="inline w-4 h-4 mr-2" />
                        Minimum Discount (%)
                      </label>
                      <input
                        type="number"
                        name="min_discount"
                        value={formData.min_discount}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="e.g., 10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Maximum Discount (%)
                      </label>
                      <input
                        type="number"
                        name="max_discount"
                        value={formData.max_discount}
                        onChange={handleInputChange}
                        min="1"
                        max="70"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent"
                        placeholder="e.g., 25"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Preferred Contract Duration
                    </label>
                    <select
                      name="contract_duration_months"
                      value={formData.contract_duration_months}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-royal-gold"
                    >
                      {contractDurations.map((duration) => (
                        <option
                          key={duration.value}
                          value={duration.value}
                          className="text-black"
                        >
                          {duration.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-royal-gold/10 border border-royal-gold/30 rounded-lg p-4">
                    <h4 className="text-royal-gold font-semibold mb-2">
                      What happens next?
                    </h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>
                        • Your application will be reviewed within 2-3 business
                        days
                      </li>
                      <li>• We'll create your partner account upon approval</li>
                      <li>
                        • You'll get access to our partner portal to manage
                        deals
                      </li>
                      <li>
                        • Start offering exclusive deals to GoSave members
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-royal-gold opacity-100"></div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentStep >= 2
                        ? "bg-royal-gold opacity-100"
                        : "bg-white/30"
                    }`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentStep >= 3
                        ? "bg-royal-gold opacity-100"
                        : "bg-white/30"
                    }`}
                  ></div>
                </div>

                {currentStep < 3 ? (
                  <Button onClick={handleNext} className="flex items-center">
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    className="flex items-center"
                  >
                    Submit Application
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default PartnerRegistrationModal;
