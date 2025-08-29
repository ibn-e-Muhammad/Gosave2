import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UserEditModal = ({ user, onClose, onUserUpdated }) => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || "",
    fullName: user?.fullName || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        fullName: user.fullName || "",
      });
    }
  }, [user]);

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

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          full_name: formData.fullName.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onUserUpdated(data.data);
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Edit User</h3>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                minLength={2}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
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

            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Current Details
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">
                  <span className="font-medium">Role:</span>
                  <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                    {user.role}
                  </span>
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded ${
                      user.status === "active"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {user.status}
                  </span>
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Membership:</span>
                  <span className="ml-2 text-white">
                    {user.membershipPlan || "Free"}
                  </span>
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Joined:</span>
                  <span className="ml-2 text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
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

export default UserEditModal;
