import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Search, Loader2, User, BookOpen, DollarSign } from "lucide-react";
import { toast } from "react-toastify";
import { theme } from "../theme";
import {
  getAllEnrollments,
  getEnrollmentById,
  getSubscriptionsByTeacherId,
  getSubscriptionBuyedById,
  getAllSubscriptionsBuyed,
} from "../services/api";

export default function Invoice() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("student");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  
  // For teacher subscription data
  const [teacherSubscriptions, setTeacherSubscriptions] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);

  const STATUS_OPTIONS = ["PENDING", "APPROVED", "PASSOUT"];
  const PAYMENT_STATUS_OPTIONS = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

  useEffect(() => {
    fetchEnrollments();
    if (activeTab === "teacher") {
      fetchAllSubscriptions();
    }
  }, []);

  useEffect(() => {
    if (activeTab === "teacher") {
      fetchAllSubscriptions();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEnrollments();
  }, [filterStatus, filterPaymentStatus]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPaymentStatus) params.paymentStatus = filterPaymentStatus;
      const response = await getAllEnrollments(params);
      let filteredEnrollments = response.data || [];

      filteredEnrollments = filteredEnrollments.filter(
        (enrollment) => enrollment.status === "APPROVED"
      );

      if (searchTerm) {
        filteredEnrollments = filteredEnrollments.filter(
          (enrollment) =>
            enrollment.enrollmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setEnrollments(filteredEnrollments);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubscriptions = async () => {
    setTeacherLoading(true);
    try {
      const response = await getAllSubscriptionsBuyed();
      setTeacherSubscriptions(response.data || []);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      setTeacherSubscriptions([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleDownloadInvoice = async (enrollmentCode, pdfUrl) => {
    try {
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
        toast.success("Invoice downloaded successfully!");
        return;
      }
      const response = await getEnrollmentById(enrollmentCode);
      const enrollment = response.data;
      if (enrollment && enrollment.pdfUrl) {
        window.open(enrollment.pdfUrl, '_blank');
        toast.success("Invoice downloaded successfully!");
      } else {
        toast.error("Invoice PDF not available yet.");
      }
    } catch (err) {
      console.error("Failed to download invoice:", err);
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-500";
      case "PASSOUT": return "bg-red-500";
      case "PENDING": return "bg-yellow-500";
      case "active": return "bg-green-500";
      case "expired": return "bg-red-500";
      case "cancelled": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PAID": return "bg-green-500";
      case "UNPAID": return "bg-red-500";
      case "FAILED": return "bg-orange-500";
      case "REFUNDED": return "bg-blue-500";
      case "paid": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalAmount = (enrollmentList) => {
    return enrollmentList.reduce((total, enrollment) => {
      return total + (Number(enrollment.amountPaid) || 0);
    }, 0);
  };

  const calculateSubscriptionTotal = (subscriptionList) => {
    return subscriptionList.reduce((total, subscription) => {
      return total + (Number(subscription.price) || 0);
    }, 0);
  };

  const handleDownloadSubscriptionInvoice = async (subscriptionId, pdfUrl) => {
    try {
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
        toast.success("Invoice downloaded successfully!");
        return;
      }
      const response = await getSubscriptionBuyedById(subscriptionId);
      const subscription = response.data;
      if (subscription && subscription.pdfUrl) {
        window.open(subscription.pdfUrl, '_blank');
        toast.success("Invoice downloaded successfully!");
      } else {
        toast.error("Invoice PDF not available yet.");
      }
    } catch (err) {
      console.error("Failed to download invoice:", err);
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  // Render Student Invoice Tab
  const renderStudentInvoice = () => (
    <>
      <div className="p-3 sm:p-4 rounded-lg shadow-md mb-4 sm:mb-6" style={{ backgroundColor: theme.colors.card }}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1 w-full lg:w-auto">
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>Search</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-10 py-2 border rounded-md bg-white" 
                placeholder="Search by enrollment code, student name, or course name..." 
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{status}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>Payment Status</label>
              <select 
                value={filterPaymentStatus} 
                onChange={(e) => setFilterPaymentStatus(e.target.value)} 
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                <option value="">All Payment Status</option>
                {PAYMENT_STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{status}</option>))}
              </select>
            </div>
            <button 
              onClick={fetchEnrollments} 
              className="px-4 py-2 text-white rounded-md" 
              style={{ backgroundColor: theme.colors.primary }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.card }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full" style={{ backgroundColor: `${theme.colors.primary}20` }}>
              <BookOpen className="w-6 h-6" style={{ color: theme.colors.primary }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Enrollments</p>
              <p className="text-2xl font-bold">{enrollments.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.card }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#22c55e20' }}>
              <DollarSign className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Amount</p>
              <p className="text-2xl font-bold">₹{calculateTotalAmount(enrollments).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.card }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#f59e0b20' }}>
              <User className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Unique Students</p>
              <p className="text-2xl font-bold">{new Set(enrollments.map(e => e.studentId)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading enrollments...</div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-10">No enrollments found.</div>
      ) : (
        <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: theme.colors.card }}>
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full min-w-full">
              <thead style={{ backgroundColor: theme.colors.secondary }}>
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Enrollment Code</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Student</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Course</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Payment Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {enrollment.enrollmentCode}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/students/profile/${enrollment.studentId}`)}>
                      <div className="text-sm font-medium">{enrollment.studentName}</div>
                      <div className="text-sm">{enrollment.studentEmail}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/course/profile/${enrollment.courseCode}`)}>
                      <div className="text-sm font-medium">{enrollment.courseName}</div>
                      <div className="text-sm">{enrollment.courseCode}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
                        {enrollment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {enrollment.amountPaid ? `₹${Number(enrollment.amountPaid).toLocaleString()}` : "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(enrollment.enrollmentDate)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDownloadInvoice(enrollment.enrollmentCode, enrollment.pdfUrl)} 
                        className="flex items-center gap-1 px-3 py-1 text-white rounded-md"
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  // Render Teacher Invoice Tab - Shows all teacher subscriptions
  const renderTeacherInvoice = () => (
    <>
      {teacherLoading ? (
        <div className="text-center py-10">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: theme.colors.primary }} />
          <p className="mt-2">Loading subscription data...</p>
        </div>
      ) : teacherSubscriptions.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
          <p className="text-lg" style={{ color: theme.colors.textSecondary }}>No teacher subscriptions found.</p>
        </div>
      ) : (
        <>
          {/* Teacher Subscriptions Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.card }}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full" style={{ backgroundColor: `${theme.colors.primary}20` }}>
                  <BookOpen className="w-6 h-6" style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Subscriptions</p>
                  <p className="text-2xl font-bold">{teacherSubscriptions.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.card }}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full" style={{ backgroundColor: '#22c55e20' }}>
                  <DollarSign className="w-6 h-6" style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Business</p>
                  <p className="text-2xl font-bold">₹{calculateSubscriptionTotal(teacherSubscriptions).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.card }}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full" style={{ backgroundColor: '#f59e0b20' }}>
                  <User className="w-6 h-6" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Unique Teachers</p>
                  <p className="text-2xl font-bold">{new Set(teacherSubscriptions.map(s => s.teacherId)).size}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
              Teacher Subscriptions ({teacherSubscriptions.length})
            </h3>
            <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: theme.colors.card }}>
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full min-w-full">
                  <thead style={{ backgroundColor: theme.colors.secondary }}>
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Order ID</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Teacher ID</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Teacher Name</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Plan Name</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Duration</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Payment Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Amount</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Start Date</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">End Date</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSubscriptions.map((subscription) => (
                      <tr key={subscription.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {subscription.orderId || "-"}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {subscription.teacherId}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {subscription.teacherName}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {subscription.planName}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {subscription.durationDays} days
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getPaymentStatusColor(subscription.paymentStatus)}`}>
                            {subscription.paymentStatus}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {subscription.price ? `₹${Number(subscription.price).toLocaleString()}` : "-"}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(subscription.startDate)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(subscription.endDate)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleDownloadSubscriptionInvoice(subscription.id, subscription.pdfUrl)} 
                            className="flex items-center gap-1 px-3 py-1 text-white rounded-md"
                            style={{ backgroundColor: theme.colors.primary }}
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                            Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="p-2 sm:p-4 min-h-screen" style={{ backgroundColor: theme.colors.secondary }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h1 className="text-lg sm:text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
          <FileText className="w-5 h-5 inline mr-2" />
          Invoice Management
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6" style={{ borderColor: theme.colors.border }}>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "student"
              ? "border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          style={{
            color: activeTab === "student" ? theme.colors.primary : theme.colors.textSecondary,
            borderColor: activeTab === "student" ? theme.colors.primary : "transparent",
          }}
          onClick={() => setActiveTab("student")}
        >
          <User className="w-4 h-4 inline mr-2" />
          Student Invoice
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "teacher"
              ? "border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          style={{
            color: activeTab === "teacher" ? theme.colors.primary : theme.colors.textSecondary,
            borderColor: activeTab === "teacher" ? theme.colors.primary : "transparent",
          }}
          onClick={() => setActiveTab("teacher")}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Teacher Invoice
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "student" ? renderStudentInvoice() : renderTeacherInvoice()}
    </div>
  );
}
