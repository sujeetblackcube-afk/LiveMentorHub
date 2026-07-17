import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Loader2, Search, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { theme } from "../theme";
import {
  createSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
} from "../services/api";

export default function Subscription() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingLoading, setSavingLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [formData, setFormData] = useState({
    planName: "",
    durationDays: "",
    CoursesAllowed: "",
    price: "",
    status: "active",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [fullScreenLoading, setFullScreenLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [filterStatus]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const response = await getAllSubscriptions(params);
      let filteredSubscriptions = response.data || [];

      // Client-side search filtering
      if (searchTerm) {
        filteredSubscriptions = filteredSubscriptions.filter(
          (sub) =>
            sub.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setSubscriptions(filteredSubscriptions);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = () => {
    setEditingSubscription(null);
    setFormData({
      planName: "",
      durationDays: "",
      CoursesAllowed: "",
      price: "",
      status: "active",
    });
    setFieldErrors({});
    setIsPopupOpen(true);
  };

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      planName: subscription.planName,
      durationDays: subscription.durationDays,
      CoursesAllowed: subscription.CoursesAllowed || "",
      price: subscription.price,
      status: subscription.status,
    });
    setFieldErrors({});
    setIsPopupOpen(true);
  };

  const handleDeleteSubscription = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      setFullScreenLoading(true);
      try {
        await deleteSubscription(id);
        setSubscriptions(subscriptions.filter((s) => s.id !== id));
        toast.success("Subscription deleted successfully!");
      } catch (err) {
        console.error("Failed to delete subscription:", err);
        toast.error("Failed to delete subscription. Please try again.");
      } finally {
        setFullScreenLoading(false);
      }
    }
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.planName) errors.planName = true;
    if (!formData.durationDays) errors.durationDays = true;
    if (!formData.price && formData.price !== 0) errors.price = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill all required fields");
      return;
    }

    setFieldErrors({});
    setSavingLoading(true);
    setFullScreenLoading(true);

    try {
      const subscriptionData = {
        planName: formData.planName,
        durationDays: parseInt(formData.durationDays),
        CoursesAllowed: formData.CoursesAllowed ? parseInt(formData.CoursesAllowed) : 0,
        price: parseFloat(formData.price),
        status: formData.status,
      };

      if (editingSubscription) {
        const response = await updateSubscription(editingSubscription.id, subscriptionData);
        setSubscriptions(
          subscriptions.map((s) =>
            s.id === editingSubscription.id ? response.data : s
          )
        );
        toast.success("Subscription updated successfully!");
      } else {
        const response = await createSubscription(subscriptionData);
        setSubscriptions([response.data, ...subscriptions]);
        toast.success("Subscription created successfully!");
      }
      setIsPopupOpen(false);
    } catch (err) {
      console.error("Failed to save subscription:", err);
      toast.error("Failed to save subscription. Please try again.");
    } finally {
      setSavingLoading(false);
      setFullScreenLoading(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingSubscription(null);
    setFormData({
      planName: "",
      durationDays: "",
      CoursesAllowed: "",
      price: "",
      status: "active",
    });
    setFieldErrors({});
  };

  const handleSearch = () => {
    fetchSubscriptions();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "expired":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "expired":
        return <XCircle className="w-4 h-4" />;
      case "cancelled":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = !searchTerm || 
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      className="p-2 sm:p-4"
      style={{ backgroundColor: theme.colors.secondary, minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1
          className="text-lg sm:text-xl font-semibold"
          style={{ color: theme.colors.textPrimary }}
        >
          Subscriptions
        </h1>
        <button
          onClick={handleAddSubscription}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-md"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Search and Filters */}
      <div
        className="p-3 sm:p-4 rounded-lg shadow-md mb-4 sm:mb-6"
        style={{ backgroundColor: theme.colors.card }}
      >
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-end">
          <div className="flex-1 min-w-0 sm:min-w-64">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.textPrimary }}
            >
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.card,
                  color: theme.colors.textPrimary,
                  focusRingColor: theme.colors.primary,
                }}
                placeholder="Search by plan name..."
              />
              <Search
                className="absolute left-3 top-2.5 w-4 h-4"
                style={{ color: theme.colors.textSecondary }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 w-4 h-4 hover:opacity-80"
                  style={{ color: theme.colors.textSecondary }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.textPrimary }}
            >
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.card,
                color: theme.colors.textPrimary,
                focusRingColor: theme.colors.primary,
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-4 py-2 text-white rounded-md"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Subscription Cards */}
      {loading ? (
        <div
          className="text-center py-8 sm:py-10"
          style={{ color: theme.colors.textSecondary }}
        >
          Loading subscriptions...
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div
          className="text-center py-8 sm:py-10"
          style={{ color: theme.colors.textSecondary }}
        >
          No subscriptions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: theme.colors.card }}
            >
              {/* Card Header */}
              <div
                className="p-4"
                style={{
                  backgroundColor: theme.colors.primary,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-white" />
                    <h3 className="text-white font-semibold text-lg">
                      {subscription.planName}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditSubscription(subscription)}
                      className="p-1.5 rounded bg-white/20 hover:bg-white/30 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubscription(subscription.id)}
                      className="p-1.5 rounded bg-white/20 hover:bg-white/30 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Price
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    ₹{subscription.price}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Duration
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {subscription.durationDays} Days
                  </span>
                </div>

                {/* Courses Allowed */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Courses Allowed
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {subscription.CoursesAllowed || 0}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Status
                  </span>
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                      subscription.status
                    )}`}
                  >
                    {getStatusIcon(subscription.status)}
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="w-full max-w-md rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4"
              style={{ borderBottom: `1px solid ${theme.colors.border}` }}
            >
              <h2
                className="text-base sm:text-lg font-semibold"
                style={{ color: theme.colors.textPrimary }}
              >
                {editingSubscription ? "Edit Subscription" : "Add Subscription"}
              </h2>
              <button
                onClick={handleClosePopup}
                className="transition hover:opacity-80"
                style={{ color: theme.colors.textSecondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData({ ...formData, planName: e.target.value })
                  }
                  className={`w-full px-3 py-2 border ${
                    fieldErrors.planName
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="e.g., Basic, Premium, Enterprise"
                />
                {fieldErrors.planName && (
                  <p className="text-red-500 text-xs mt-1">
                    Please fill this field
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) =>
                    setFormData({ ...formData, durationDays: e.target.value })
                  }
                  className={`w-full px-3 py-2 border ${
                    fieldErrors.durationDays
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="e.g., 30, 90, 365"
                  min="1"
                />
                {fieldErrors.durationDays && (
                  <p className="text-red-500 text-xs mt-1">
                    Please fill this field
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courses Allowed
                </label>
                <input
                  type="number"
                  value={formData.CoursesAllowed}
                  onChange={(e) =>
                    setFormData({ ...formData, CoursesAllowed: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Number of courses"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={`w-full px-3 py-2 border ${
                    fieldErrors.price ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
                {fieldErrors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    Please fill this field
                  </p>
                )}
              </div>

              {editingSubscription && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4"
              style={{ borderTop: `1px solid ${theme.colors.border}` }}
            >
              <button
                onClick={handleClosePopup}
                className="px-3 sm:px-4 py-2 rounded-md transition"
                style={{
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={savingLoading}
                className="px-3 sm:px-4 py-2 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {savingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {savingLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Loading Overlay */}
      {fullScreenLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
