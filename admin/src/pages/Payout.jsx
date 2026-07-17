import React, { useState, useEffect } from "react";
import { Plus, Search, X, Loader2, CreditCard, DollarSign, User, Calendar, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { theme } from "../theme";
import {
  createPayment,
  getAllPayments,
  getTeachers,
} from "../services/api";

export default function Payout() {
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [savingLoading, setSavingLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: "",
    amount: "",
    paymentMethod: "",
    transactionId: "",
    orderId: "",
    paidAt: "",
    status: "pending",
    remarks: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [fullScreenLoading, setFullScreenLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const response = await getAllPayments(params);
      let filteredPayments = response.data || [];

      // Client-side search filtering
      if (searchTerm) {
        filteredPayments = filteredPayments.filter(
          (payment) =>
            payment.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.teacherId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setPayments(filteredPayments);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const response = await getTeachers({ status: "APPROVED" });
      setTeachers(response.data || []);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      setTeachers([]);
    } finally {
      setTeachersLoading(false);
    }
  };

  const handleAddPayment = () => {
    setFormData({
      teacherId: "",
      amount: "",
      paymentMethod: "",
      transactionId: "",
      orderId: "",
      paidAt: "",
      status: "pending",
      remarks: "",
    });
    setFieldErrors({});
    setIsPopupOpen(true);
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.teacherId) errors.teacherId = true;
    if (!formData.amount) errors.amount = true;
    if (!formData.paymentMethod) errors.paymentMethod = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill all required fields");
      return;
    }

    setFieldErrors({});
    setSavingLoading(true);
    setFullScreenLoading(true);

    try {
      const paymentData = {
        teacherId: formData.teacherId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || null,
        orderId: formData.orderId || null,
        paidAt: formData.paidAt || null,
        status: formData.status,
        remarks: formData.remarks || null,
      };

      const response = await createPayment(paymentData);
      setPayments([response.data, ...payments]);
      toast.success("Payment created successfully!");
      setIsPopupOpen(false);
    } catch (err) {
      console.error("Failed to create payment:", err);
      toast.error(err.response?.data?.message || "Failed to create payment. Please try again.");
    } finally {
      setSavingLoading(false);
      setFullScreenLoading(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setFormData({
      teacherId: "",
      amount: "",
      paymentMethod: "",
      transactionId: "",
      orderId: "",
      paidAt: "",
      status: "pending",
      remarks: "",
    });
    setFieldErrors({});
  };

  const handleSearch = () => {
    fetchPayments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Filter payments based on search term
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = !searchTerm || 
      payment.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.teacherId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get teacher name by ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.teacherId === teacherId);
    return teacher ? teacher.name : teacherId;
  };

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
          Payouts
        </h1>
        <button
          onClick={handleAddPayment}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-md"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <Plus className="w-4 h-4" />
          Create Payment
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
                placeholder="Search by teacher name or ID..."
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
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

      {/* Payment Cards */}
      {loading ? (
        <div
          className="text-center py-8 sm:py-10"
          style={{ color: theme.colors.textSecondary }}
        >
          Loading payments...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div
          className="text-center py-8 sm:py-10"
          style={{ color: theme.colors.textSecondary }}
        >
          No payments found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
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
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold text-lg truncate">
                    {payment.teacherName || "Unknown Teacher"}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Teacher ID */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Teacher ID
                  </span>
                  <span
                    className="text-sm font-medium truncate ml-2"
                    style={{ color: theme.colors.textPrimary }}
                    title={payment.teacherId}
                  >
                    {payment.teacherId}
                  </span>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Amount
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    ₹{payment.amount}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Method
                  </span>
                  <span
                    className="text-sm font-medium capitalize"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {payment.paymentMethod}
                  </span>
                </div>

                {/* Transaction ID */}
                {payment.transactionId && (
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Transaction ID
                    </span>
                    <span
                      className="text-xs font-medium truncate ml-2"
                      style={{ color: theme.colors.textPrimary }}
                      title={payment.transactionId}
                    >
                      {payment.transactionId}
                    </span>
                  </div>
                )}

                {/* Requested Date */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Requested
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {payment.requestedAt ? new Date(payment.requestedAt).toLocaleDateString() : "-"}
                  </span>
                </div>

                {/* Paid Date */}
                {payment.paidAt && (
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Paid Date
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

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
                      payment.status
                    )}`}
                  >
                    {getStatusIcon(payment.status)}
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
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
                Create Payment
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
              {/* Teacher Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher *
                </label>
                {teachersLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading teachers...
                  </div>
                ) : (
                  <select
                    value={formData.teacherId}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherId: e.target.value })
                    }
                    className={`w-full px-3 py-2 border ${
                      fieldErrors.teacherId
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.teacherId} value={teacher.teacherId}>
                        {teacher.name} ({teacher.teacherId})
                      </option>
                    ))}
                  </select>
                )}
                {fieldErrors.teacherId && (
                  <p className="text-red-500 text-xs mt-1">
                    Please select a teacher
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className={`w-full px-3 py-2 border ${
                    fieldErrors.amount
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
                {fieldErrors.amount && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter amount
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className={`w-full px-3 py-2 border ${
                    fieldErrors.paymentMethod
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Select Payment Method</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
                {fieldErrors.paymentMethod && (
                  <p className="text-red-500 text-xs mt-1">
                    Please select payment method
                  </p>
                )}
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter transaction ID (optional)"
                />
              </div>

              {/* Order ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) =>
                    setFormData({ ...formData, orderId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter order ID (optional)"
                />
              </div>

              {/* Paid At Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={formData.paidAt}
                  onChange={(e) =>
                    setFormData({ ...formData, paidAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for pending status
                </p>
              </div>

              {/* Status */}
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
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter remarks (optional)"
                  rows="3"
                />
              </div>
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
                {savingLoading ? "Creating..." : "Create Payment"}
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
