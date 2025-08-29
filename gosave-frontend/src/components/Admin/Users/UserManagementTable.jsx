import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import UserEditModal from "./UserEditModal";
import UserStatsCards from "./UserStatsCards";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UserManagementTable = () => {
  const { session } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    role: "",
    search: "",
  });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(filters.status && { status: filters.status }),
        ...(filters.role && { role: filters.role }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(
        `${API_URL}/api/v1/admin/users?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/users/stats`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchUsers(1);
      fetchStats();
    }
  }, [session?.access_token, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update user in local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
        // Refresh stats
        fetchStats();
      } else {
        alert("Failed to update user status: " + data.error);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update user status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update user in local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        // Refresh stats
        fetchStats();
      } else {
        alert("Failed to update user role: " + data.error);
      }
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update user role");
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "suspended":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "partner":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "member":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "viewer":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && <UserStatsCards stats={stats} />}

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="partner">Partner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: "", role: "", search: "" })}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">User Management</h3>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-500/20 border-l-4 border-red-500">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(
                        user.role
                      )} bg-transparent`}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="partner">Partner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleStatusChange(
                          user.id,
                          user.status === "active" ? "suspended" : "active"
                        )
                      }
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${getStatusBadgeClass(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {user.membershipPlan || "Free"}
                    {user.membershipPrice && (
                      <div className="text-xs text-gray-400">
                        ${user.membershipPrice}/mo
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchUsers(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};

export default UserManagementTable;
