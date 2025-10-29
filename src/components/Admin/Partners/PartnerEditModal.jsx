import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PartnerEditModal = ({ partner, onClose, onPartnerUpdated }) => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    brand_name: "",
    owner_name: "",
    email: "",
    phone: "",
    website: "",
    business_type: "",
    address: "",
    city: "",
    min_discount: "",
    max_discount: "",
    contract_duration_months: "",
    admin_notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (partner) {
      setFormData({
        brand_name: partner.brandName || "",
        owner_name: partner.ownerName || "",
        email: partner.email || "",
        phone: partner.phone || "",
        website: partner.website || "",
        business_type: partner.businessType || "",
        address: partner.address || "",
        city: partner.city || "",
        min_discount: partner.minDiscount || "",
        max_discount: partner.maxDiscount || "",
        contract_duration_months: partner.contractDuration || "",
        admin_notes: partner.adminNotes || "",
      });
    }
  }, [partner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (formData.min_discount && formData.max_discount) {
      const minDiscount = parseFloat(formData.min_discount);
      const maxDiscount = parseFloat(formData.max_discount);

      if (minDiscount > maxDiscount) {
        setError("Minimum discount cannot be greater than maximum discount");
        setLoading(false);
        return;
      }
    }

    try {
      // Prepare data for API (convert empty strings to undefined to avoid overwriting)
      const updateData = {};
      Object.keys(formData).forEach((key) => {
        const value = formData[key].trim();
        if (value !== "") {
          if (
            key === "min_discount" ||
            key === "max_discount" ||
            key === "contract_duration_months"
          ) {
            updateData[key] = parseFloat(value) || undefined;
          } else {
            updateData[key] = value;
          }
        }
      });

      const response = await fetch(`${API_URL}/api/v1/partners/${partner.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        onPartnerUpdated(data.data);
      } else {
        setError(data.error || "Failed to update partner");
      }
    } catch (err) {
      console.error("Error updating partner:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (!partner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Edit Partner</h3>
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
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Partner Status Info */}
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-white">
                  {partner.brandName}
                </h4>
                <p className="text-gray-400">
                  Status:
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      partner.status === "approved"
                        ? "bg-green-500/20 text-green-300"
                        : partner.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {partner.status}
                  </span>
                </p>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p>
                  Created: {new Date(partner.createdAt).toLocaleDateString()}
                </p>
                {partner.updatedAt && (
                  <p>
                    Updated: {new Date(partner.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="brand_name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    id="brand_name"
                    name="brand_name"
                    value={formData.brand_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="owner_name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    id="owner_name"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92300123456"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="business_type"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Business Type
                  </label>
                  <select
                    id="business_type"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select business type...</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Retail">Retail</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Services">Services</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                Location Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    City *
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
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
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Business Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Complete business address"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Terms */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                Business Terms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="min_discount"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Min Discount (%)
                  </label>
                  <input
                    type="number"
                    id="min_discount"
                    name="min_discount"
                    value={formData.min_discount}
                    onChange={handleInputChange}
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
                    htmlFor="contract_duration_months"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Contract Duration (months)
                  </label>
                  <select
                    id="contract_duration_months"
                    name="contract_duration_months"
                    value={formData.contract_duration_months}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select duration...</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label
                htmlFor="admin_notes"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Admin Notes
              </label>
              <textarea
                id="admin_notes"
                name="admin_notes"
                value={formData.admin_notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Internal admin notes about this partner..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving Changes...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerEditModal;
