import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Tenants = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTenants: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    status: "",
    subscriptionPlan: "",
    search: "",
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    status: "",
    subscriptionPlan: "",
    maxUsers: "",
    maxProjects: "",
  });

  // Fetch tenants
  const fetchTenants = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
      });

      if (filters.status) params.append("status", filters.status);
      if (filters.subscriptionPlan)
        params.append("subscriptionPlan", filters.subscriptionPlan);

const url = `/tenants?${params}`;
      console.log("Fetching tenants from:", url);

      const response = await api.get(url);

      console.log("Tenants response:", response.data);

      if (response.data.success) {
        setTenants(response.data.data.tenants);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to fetch tenants. Make sure you're logged in as super_admin.";
      setError(errorMsg);
      console.error("Error fetching tenants:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Handle tenant update
  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: updateFormData.name || selectedTenant.name,
        status: updateFormData.status || selectedTenant.status,
        subscriptionPlan:
          updateFormData.subscriptionPlan || selectedTenant.subscriptionPlan,
      };

      if (updateFormData.maxUsers)
        updateData.maxUsers = parseInt(updateFormData.maxUsers);
      if (updateFormData.maxProjects)
        updateData.maxProjects = parseInt(updateFormData.maxProjects);

      const response = await api.put(
        `/tenants/${selectedTenant.id}`,
        updateData
      );

      if (response.data.success) {
        alert("Tenant updated successfully!");
        setShowUpdateModal(false);
        fetchTenants(pagination.currentPage);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update tenant");
    }
  };

  // Open update modal
  const openUpdateModal = (tenant) => {
    setSelectedTenant(tenant);
    setUpdateFormData({
      name: tenant.name,
      status: tenant.status,
      subscriptionPlan: tenant.subscriptionPlan,
      maxUsers: tenant.maxUsers,
      maxProjects: tenant.maxProjects,
    });
    setShowUpdateModal(true);
  };

  // Load tenants on mount or when filters change
  useEffect(() => {
    fetchTenants(1);
  }, [filters]);

  // Also refetch when component mounts to ensure fresh data
  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchTenants(1);
    }
  }, []);

  if (!user || user.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            Only super admins can access this page.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tenant Management
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage all tenants in the system
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="trial">Trial</option>
                </select>
              </div>

              {/* Subscription Plan Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <select
                  value={filters.subscriptionPlan}
                  onChange={(e) =>
                    setFilters({ ...filters, subscriptionPlan: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Plans</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() =>
                    setFilters({
                      status: "",
                      subscriptionPlan: "",
                      search: "",
                    })
                  }
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
                >
                  Clear Filters
                </button>
              </div>

              {/* Refresh Button */}
              <div className="flex items-end">
                <button
                  onClick={() => fetchTenants(1)}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center min-h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Tenants Table */}
          {!loading && tenants.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Tenant Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Subdomain
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Projects
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {tenant.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <code className="bg-gray-100 px-2 py-1 rounded">
                            {tenant.subdomain}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tenant.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tenant.subscriptionPlan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tenant.totalUsers || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tenant.totalProjects || 0}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => openUpdateModal(tenant)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/tenants/${tenant.id}/users`)
                            }
                            className="text-indigo-600 hover:text-indigo-900 font-medium ml-4"
                          >
                            View Users
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing page {pagination.currentPage} of{" "}
                    {pagination.totalPages} ({pagination.totalTenants} total
                    tenants)
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() =>
                        fetchTenants(Math.max(1, pagination.currentPage - 1))
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        fetchTenants(
                          Math.min(
                            pagination.totalPages,
                            pagination.currentPage + 1
                          )
                        )
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && tenants.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">No tenants found</p>
              <p className="text-gray-500">
                Try adjusting your filters or create a new tenant
              </p>
            </div>
          )}

          {/* Update Tenant Modal */}
          {showUpdateModal && selectedTenant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Update Tenant
                </h2>

                <form onSubmit={handleUpdateTenant} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tenant Name
                    </label>
                    <input
                      type="text"
                      value={updateFormData.name}
                      onChange={(e) =>
                        setUpdateFormData({
                          ...updateFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={updateFormData.status}
                      onChange={(e) =>
                        setUpdateFormData({
                          ...updateFormData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="trial">Trial</option>
                    </select>
                  </div>

                  {/* Subscription Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Plan
                    </label>
                    <select
                      value={updateFormData.subscriptionPlan}
                      onChange={(e) =>
                        setUpdateFormData({
                          ...updateFormData,
                          subscriptionPlan: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  {/* Max Users */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Users
                    </label>
                    <input
                      type="number"
                      value={updateFormData.maxUsers}
                      onChange={(e) =>
                        setUpdateFormData({
                          ...updateFormData,
                          maxUsers: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Max Projects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Projects
                    </label>
                    <input
                      type="number"
                      value={updateFormData.maxProjects}
                      onChange={(e) =>
                        setUpdateFormData({
                          ...updateFormData,
                          maxProjects: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpdateModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tenants;
