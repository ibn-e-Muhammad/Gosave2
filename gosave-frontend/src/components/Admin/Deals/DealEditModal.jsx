import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DealEditModal = ({
  deal,
  onClose,
  onDealUpdated,
  partners = [],
  categories = [],
}) => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    partner_id: "",
    deal_title: "",
    description: "",
    start_date: "",
    end_date: "",
    min_discount: "",
    max_discount: "",
    membership_tier: "basic",
    location: "",
    city: "",
    image_url: "",
    terms_conditions: "",
    usage_instructions: "",
    max_redemptions: "",
    is_featured: false,
    status: "active",
    category_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [approvedPartners, setApprovedPartners] = useState([]);

  useEffect(() => {
    fetchApprovedPartners();
    if (deal) {
      // Edit mode - populate form with existing deal data
      setFormData({
        partner_id: deal.brandId || "",
        deal_title: deal.title || "",
        description: deal.description || "",
        start_date: deal.startDate || "",
        end_date: deal.endDate || "",
        min_discount: deal.minDiscount || "",
        max_discount: deal.maxDiscount || "",
        membership_tier: deal.tier || "basic",
        location: deal.location || "",
        city: deal.city || "",
        image_url: deal.imageUrl || "",
        terms_conditions: deal.termsConditions || "",
        usage_instructions: deal.usageInstructions || "",
        max_redemptions: deal.maxRedemptions || "",
        is_featured: deal.isFeatured || false,
        status: deal.status || "active",
        category_id: deal.categoryId || "",
      });
    }
  }, [deal]);

  const fetchApprovedPartners = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/partners`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setApprovedPartners(data.data || []);
      } else {
        setApprovedPartners([]);
      }
    } catch (error) {
      console.error("Error fetching approved partners:", error);
      setApprovedPartners([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.partner_id) errors.push("Partner is required");
    if (!formData.deal_title.trim()) errors.push("Deal title is required");
    if (!formData.start_date) errors.push("Start date is required");
    if (!formData.end_date) errors.push("End date is required");
    if (!formData.min_discount || formData.min_discount < 0)
      errors.push("Valid minimum discount is required");

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      errors.push("End date must be after start date");
    }

    if (
      formData.max_discount &&
      parseFloat(formData.max_discount) < parseFloat(formData.min_discount)
    ) {
      errors.push("Maximum discount cannot be less than minimum discount");
    }

    if (formData.max_redemptions && parseInt(formData.max_redemptions) < 0) {
      errors.push("Maximum redemptions must be a positive number");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        min_discount: parseFloat(formData.min_discount),
        max_discount: formData.max_discount
          ? parseFloat(formData.max_discount)
          : parseFloat(formData.min_discount),
        max_redemptions: formData.max_redemptions
          ? parseInt(formData.max_redemptions)
          : 0,
      };

      const url = deal
        ? `${API_URL}/api/v1/deals/admin/${deal.id}`
        : `${API_URL}/api/v1/deals/admin/create`;

      const method = deal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        onDealUpdated(data.data);
        onClose();
      } else {
        setError(data.error || `Failed to ${deal ? "update" : "create"} deal`);
      }
    } catch (err) {
      console.error(`Error ${deal ? "updating" : "creating"} deal:`, err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white">
              {deal ? "Edit Deal" : "Create New Deal"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="partner_id"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Partner *
                  </label>
                  <select
                    id="partner_id"
                    name="partner_id"
                    value={formData.partner_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select partner...</option>
                    {(approvedPartners || []).map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.brandName} - {partner.ownerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="category_id"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="deal_title"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Deal Title *
                  </label>
                  <input
                    type="text"
                    id="deal_title"
                    name="deal_title"
                    value={formData.deal_title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 30% Off All Menu Items"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Detailed description of the deal..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="image_url"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/deal-image.jpg"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Deal Terms */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                Deal Terms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="min_discount"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Min Discount (%) *
                  </label>
                  <input
                    type="number"
                    id="min_discount"
                    name="min_discount"
                    value={formData.min_discount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="max_discount"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Max Discount (%)
                  </label>
                  <input
                    type="number"
                    id="max_discount"
                    name="max_discount"
                    value={formData.max_discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="membership_tier"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Membership Tier *
                  </label>
                  <select
                    id="membership_tier"
                    name="membership_tier"
                    value={formData.membership_tier}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="max_redemptions"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    id="max_redemptions"
                    name="max_redemptions"
                    value={formData.max_redemptions}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0 = unlimited"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Dates and Location */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                Dates and Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    min={
                      formData.start_date ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    City
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select city...</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., DHA Phase 2"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Instructions */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                Terms and Instructions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="terms_conditions"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Terms & Conditions
                  </label>
                  <textarea
                    id="terms_conditions"
                    name="terms_conditions"
                    value={formData.terms_conditions}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Terms and conditions for this deal..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="usage_instructions"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Usage Instructions
                  </label>
                  <textarea
                    id="usage_instructions"
                    name="usage_instructions"
                    value={formData.usage_instructions}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="How to redeem this deal..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Status and Settings */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                Status and Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div className="flex items-center mt-8">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4 text-indigo-600 bg-transparent border-white/20 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="is_featured"
                    className="text-sm font-medium text-gray-300"
                  >
                    Featured Deal (appears prominently on homepage)
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {deal ? "Updating..." : "Creating..."}
                  </div>
                ) : deal ? (
                  "Update Deal"
                ) : (
                  "Create Deal"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DealEditModal;
