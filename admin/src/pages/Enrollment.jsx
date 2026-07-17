import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Trash2, X, Loader2, Search, UserCheck, Pencil, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { theme } from "../theme";
import {
  createEnrollment,
  getAllEnrollments,
  updateEnrollment,
  deleteEnrollment,
  getStudents,
  getAllCourses,
  getTeachers,
  updateTeacherIdInEnrollments,
  getEnrollmentsByCourseCode,
  getEnrollmentById,
} from "../services/api";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "PASSOUT"];
const PAYMENT_STATUS_OPTIONS = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

export default function Enrollment() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingLoading, setSavingLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
  const [viewEnrollment, setViewEnrollment] = useState(null);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    status: "PENDING",
    paymentStatus: "UNPAID",
    isRefunded: false,
    refundedAmount: "",
    refundDate: "",
    remarks: "",
    enrollmentExpireDate: "",
  });
  const [updatingId, setUpdatingId] = useState(null);
  const [fullScreenLoading, setFullScreenLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [teachers, setTeachers] = useState([]);
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);
  const [assignTeacherData, setAssignTeacherData] = useState({
    courseCode: "",
    teacherId: "",
    studentIds: [],
  });
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignTeacherErrors, setAssignTeacherErrors] = useState({});
  
  // NEW: Track students grouped by teacher assignment status
  const [studentsWithoutTeacher, setStudentsWithoutTeacher] = useState([]);
  const [studentsWithTeacher, setStudentsWithTeacher] = useState([]);

  // Process enrollments into two groups when courseEnrollments changes
  useEffect(() => {
    if (courseEnrollments.length > 0) {
      const withoutTeacher = courseEnrollments.filter(
        (e) => !e.teacherId || e.teacherId === ""
      );
      const withTeacher = courseEnrollments.filter(
        (e) => e.teacherId && e.teacherId !== ""
      );
      setStudentsWithoutTeacher(withoutTeacher);
      setStudentsWithTeacher(withTeacher);
    } else {
      setStudentsWithoutTeacher([]);
      setStudentsWithTeacher([]);
    }
  }, [courseEnrollments]);

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [filterStatus, filterPaymentStatus]);

  useEffect(() => {
    fetchEnrollments();
  }, [searchTerm]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPaymentStatus) params.paymentStatus = filterPaymentStatus;
      const response = await getAllEnrollments(params);
      let filteredEnrollments = response.data || [];

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

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response.data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      setCourses(response.data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await getTeachers();
      setTeachers(response.data || []);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  const fetchCourseEnrollments = async (courseCode) => {
    try {
      const response = await getEnrollmentsByCourseCode(courseCode);
      setCourseEnrollments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch course enrollments:", err);
    }
  };

  const handleAddEnrollment = () => {
    setEditingEnrollment(null);
    setFormData({
      studentId: "",
      courseCode: "",
      status: "PENDING",
      paymentStatus: "UNPAID",
      isRefunded: false,
      refundedAmount: "",
      refundDate: "",
      remarks: "",
      enrollmentExpireDate: "",
      paymentMethod: "",
      amountPaid: "",
      currency: "INR",
    });
    setFieldErrors({});
    setIsPopupOpen(true);
  };

  // View enrollment details
  const handleViewEnrollment = async (enrollmentCode) => {
    setFullScreenLoading(true);
    try {
      const response = await getEnrollmentById(enrollmentCode);
      setViewEnrollment(response.data);
      setIsViewPopupOpen(true);
    } catch (err) {
      console.error("Failed to fetch enrollment details:", err);
      toast.error("Failed to fetch enrollment details.");
    } finally {
      setFullScreenLoading(false);
    }
  };

  // Edit enrollment
  const handleEditEnrollment = async (enrollmentCode) => {
    setFullScreenLoading(true);
    try {
      const response = await getEnrollmentById(enrollmentCode);
      const enrollment = response.data;
      
      setEditingEnrollment(enrollment);
      setFormData({
        status: enrollment.status || "PENDING",
        paymentStatus: enrollment.paymentStatus || "UNPAID",
        isRefunded: enrollment.isRefunded || false,
        refundedAmount: enrollment.refundedAmount || "",
        refundDate: enrollment.refundDate ? enrollment.refundDate.split('T')[0] : "",
        remarks: enrollment.remarks || "",
        enrollmentExpireDate: enrollment.enrollmentExpireDate ? enrollment.enrollmentExpireDate.split('T')[0] : "",
      });
      setFieldErrors({});
      setIsPopupOpen(true);
    } catch (err) {
      console.error("Failed to fetch enrollment details:", err);
      toast.error("Failed to fetch enrollment details.");
    } finally {
      setFullScreenLoading(false);
    }
  };

  const handleStatusUpdate = async (enrollmentCode, newStatus) => {
    setUpdatingId(enrollmentCode);
    try {
      await updateEnrollment(enrollmentCode, { status: newStatus });
      setEnrollments(
        enrollments.map((e) =>
          e.enrollmentCode === enrollmentCode ? { ...e, status: newStatus } : e
        )
      );
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteEnrollment = async (enrollmentCode) => {
    if (window.confirm("Are you sure you want to delete this enrollment?")) {
      setFullScreenLoading(true);
      try {
        await deleteEnrollment(enrollmentCode);
        setEnrollments(enrollments.filter((e) => e.enrollmentCode !== enrollmentCode));
        toast.success("Enrollment deleted successfully!");
      } catch (err) {
        console.error("Failed to delete enrollment:", err);
        toast.error("Failed to delete enrollment. Please try again.");
      } finally {
        setFullScreenLoading(false);
      }
    }
  };

  const handleAddSave = async () => {
    // Validation for add enrollment
    const errors = {};
    if (!formData.studentId) errors.studentId = true;
    if (!formData.courseCode) errors.courseCode = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill all required fields");
      return;
    }

    setSavingLoading(true);
    setFullScreenLoading(true);

    try {
      
      const enrollmentData = {
        studentId: formData.studentId,
        courseCode: formData.courseCode,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod || null,
        amountPaid: formData.amountPaid || 0,
        currency: formData.currency || "INR",
        remarks: formData.remarks || "",
       
      };

      await createEnrollment(enrollmentData);
      toast.success("Enrollment created successfully!");
      setIsPopupOpen(false);
      fetchEnrollments();
    } catch (err) {
      console.error("Failed to create enrollment:", err);
      toast.error(err.response?.data?.message || "Failed to create enrollment. Please try again.");
    } finally {
      setSavingLoading(false);
      setFullScreenLoading(false);
    }
  };

  const handleSave = async () => {
    setSavingLoading(true);
    setFullScreenLoading(true);

    try {
      const updateData = {
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        isRefunded: formData.isRefunded,
        refundedAmount: formData.refundedAmount || null,
        refundDate: formData.refundDate || null,
        remarks: formData.remarks,
        enrollmentExpireDate: formData.enrollmentExpireDate || null,
      };

      await updateEnrollment(editingEnrollment.enrollmentCode, updateData);
      setEnrollments(
        enrollments.map((e) =>
          e.enrollmentCode === editingEnrollment.enrollmentCode ? { ...e, ...updateData } : e
        )
      );
      toast.success("Enrollment updated successfully!");
      setIsPopupOpen(false);
    } catch (err) {
      console.error("Failed to save enrollment:", err);
      toast.error("Failed to save enrollment. Please try again.");
    } finally {
      setSavingLoading(false);
      setFullScreenLoading(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingEnrollment(null);
    setFormData({
      status: "PENDING",
      paymentStatus: "UNPAID",
      isRefunded: false,
      refundedAmount: "",
      refundDate: "",
      remarks: "",
      enrollmentExpireDate: "",
    });
  };

  const handleCloseViewPopup = () => {
    setIsViewPopupOpen(false);
    setViewEnrollment(null);
  };

  const handleSearch = () => {
    fetchEnrollments();
  };

  const handleOpenAssignTeacher = () => {
    setAssignTeacherData({ courseCode: "", teacherId: "", studentIds: [] });
    setCourseEnrollments([]);
    setAssignTeacherErrors({});
    setIsAssignTeacherOpen(true);
  };

  const handleCloseAssignTeacher = () => {
    setIsAssignTeacherOpen(false);
    setAssignTeacherData({ courseCode: "", teacherId: "", studentIds: [] });
    setCourseEnrollments([]);
    setAssignTeacherErrors({});
  };

  const handleCourseChange = (e) => {
    const courseCode = e.target.value;
    setAssignTeacherData({ ...assignTeacherData, courseCode, studentIds: [] });
    setAssignTeacherErrors({ ...assignTeacherErrors, courseCode: false });
    if (courseCode) {
      fetchCourseEnrollments(courseCode);
    } else {
      setCourseEnrollments([]);
    }
  };

  const handleTeacherChange = (e) => {
    setAssignTeacherData({ ...assignTeacherData, teacherId: e.target.value });
    setAssignTeacherErrors({ ...assignTeacherErrors, teacherId: false });
  };

  const handleStudentSelect = (studentId) => {
    const currentStudentIds = assignTeacherData.studentIds;
    if (currentStudentIds.includes(studentId)) {
      setAssignTeacherData({
        ...assignTeacherData,
        studentIds: currentStudentIds.filter((id) => id !== studentId),
      });
    } else {
      setAssignTeacherData({
        ...assignTeacherData,
        studentIds: [...currentStudentIds, studentId],
      });
    }
    setAssignTeacherErrors({ ...assignTeacherErrors, studentIds: false });
  };

  const handleSelectAllStudents = () => {
    const allStudentIds = courseEnrollments.map((e) => e.studentId);
    setAssignTeacherData({ ...assignTeacherData, studentIds: allStudentIds });
  };

  const handleDeselectAllStudents = () => {
    setAssignTeacherData({ ...assignTeacherData, studentIds: [] });
  };

  const handleAssignTeacher = async () => {
    const errors = {};
    if (!assignTeacherData.courseCode) errors.courseCode = true;
    if (!assignTeacherData.teacherId) errors.teacherId = true;
    if (!assignTeacherData.studentIds || assignTeacherData.studentIds.length === 0) {
      errors.studentIds = true;
    }

    if (Object.keys(errors).length > 0) {
      setAssignTeacherErrors(errors);
      toast.error("Please fill all required fields and select at least one student");
      return;
    }

    setAssignTeacherErrors({});
    setAssignLoading(true);

    try {
      await updateTeacherIdInEnrollments(
        assignTeacherData.teacherId,
        assignTeacherData.studentIds,
        assignTeacherData.courseCode
      );
      toast.success("Teacher assigned successfully!");
      handleCloseAssignTeacher();
      fetchEnrollments();
    } catch (err) {
      console.error("Failed to assign teacher:", err);
      toast.error(err.response?.data?.message || "Failed to assign teacher.");
    } finally {
      setAssignLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-500";
      case "PASSOUT": return "bg-red-500";
      case "PENDING": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PAID": return "bg-green-500";
      case "UNPAID": return "bg-red-500";
      case "FAILED": return "bg-orange-500";
      case "REFUNDED": return "bg-blue-500";
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

  return (
    <div className="p-2 sm:p-4 min-h-screen" style={{ backgroundColor: theme.colors.secondary }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h1 className="text-lg sm:text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>Enrollments</h1>
        <button onClick={handleAddEnrollment} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-md" style={{ backgroundColor: theme.colors.primary }}>
          <Plus className="w-4 h-4" /> Add Enrollment
        </button>
        <button onClick={handleOpenAssignTeacher} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-md" style={{ backgroundColor: theme.colors.success }}>
          <UserCheck className="w-4 h-4" /> Assign Teacher
        </button>
      </div>

      <div className="p-3 sm:p-4 rounded-lg shadow-md mb-4 sm:mb-6" style={{ backgroundColor: theme.colors.card }}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1 w-full lg:w-auto">
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>Search</label>
            <div className="relative">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2 border rounded-md bg-white" placeholder="Search by enrollment code, student name, or course name..." />
              <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{status}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>Payment Status</label>
              <select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">All Payment Status</option>
                {PAYMENT_STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{status}</option>))}
              </select>
            </div>
            <button onClick={handleSearch} className="px-4 py-2 text-white rounded-md" style={{ backgroundColor: theme.colors.primary }}>Search</button>
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Payment Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Teacher</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Amount Paid</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleViewEnrollment(enrollment.enrollmentCode)} className="text-blue-600 hover:underline flex items-center gap-1" title="View Details">
                        <Eye className="w-4 h-4" /> {enrollment.enrollmentCode}
                      </button>
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(enrollment.status)}`}>{enrollment.status}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getPaymentStatusColor(enrollment.paymentStatus)}`}>{enrollment.paymentStatus}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {enrollment.teacherId ? teachers.find(t => t.teacherId === enrollment.teacherId)?.teacherName || enrollment.teacherId : "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {enrollment.amountPaid ? `${enrollment.currency} ${enrollment.amountPaid}` : "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => handleEditEnrollment(enrollment.enrollmentCode)} style={{ color: theme.colors.primary }} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <select value={enrollment.status} onChange={(e) => handleStatusUpdate(enrollment.enrollmentCode, e.target.value)} disabled={updatingId === enrollment.enrollmentCode} className="px-2 py-1 text-xs border rounded-md bg-white">
                          {STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{status}</option>))}
                        </select>
                        {updatingId === enrollment.enrollmentCode && <Loader2 className="w-4 h-4 animate-spin" />}
                        <button onClick={() => handleDeleteEnrollment(enrollment.enrollmentCode)} style={{ color: theme.colors.danger }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Popup */}
      {isViewPopupOpen && viewEnrollment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-3xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.colors.card }}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <h2 className="text-lg font-semibold">Enrollment Details</h2>
              <button onClick={handleCloseViewPopup}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm font-medium text-gray-500">Enrollment Code</p><p className="text-sm">{viewEnrollment.enrollmentCode}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Status</p><p className="text-sm"><span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(viewEnrollment.status)}`}>{viewEnrollment.status}</span></p></div>
                <div><p className="text-sm font-medium text-gray-500">Student Name</p><p className="text-sm">{viewEnrollment.studentName}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Student ID</p><p className="text-sm">{viewEnrollment.studentId}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Student Email</p><p className="text-sm">{viewEnrollment.studentEmail || "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Student Mobile</p><p className="text-sm">{viewEnrollment.studentMobile || "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Student Address</p><p className="text-sm">{viewEnrollment.studentAddress || "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Course Name</p><p className="text-sm">{viewEnrollment.courseName}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Course Code</p><p className="text-sm">{viewEnrollment.courseCode}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Course Price</p><p className="text-sm">{viewEnrollment.coursePrice ? `${viewEnrollment.currency} ${viewEnrollment.coursePrice}` : "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Enrollment Date</p><p className="text-sm">{formatDate(viewEnrollment.enrollmentDate)}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Enrollment Expire Date</p><p className="text-sm">{formatDate(viewEnrollment.enrollmentExpireDate)}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Payment Status</p><p className="text-sm"><span className={`px-2 py-1 text-xs rounded-full text-white ${getPaymentStatusColor(viewEnrollment.paymentStatus)}`}>{viewEnrollment.paymentStatus}</span></p></div>
                <div><p className="text-sm font-medium text-gray-500">Amount Paid</p><p className="text-sm">{viewEnrollment.amountPaid ? `${viewEnrollment.currency} ${viewEnrollment.amountPaid}` : "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Payment Method</p><p className="text-sm">{viewEnrollment.paymentMethod || "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Transaction Number</p><p className="text-sm">{viewEnrollment.transactionNumber || "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Order ID</p><p className="text-sm">{viewEnrollment.orderId || "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Payment Date</p><p className="text-sm">{formatDate(viewEnrollment.paymentDate)}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Is Refunded</p><p className="text-sm">{viewEnrollment.isRefunded ? "Yes" : "No"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Refunded Amount</p><p className="text-sm">{viewEnrollment.refundedAmount ? `${viewEnrollment.currency} ${viewEnrollment.refundedAmount}` : "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Refund Date</p><p className="text-sm">{formatDate(viewEnrollment.refundDate)}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Teacher ID</p><p className="text-sm">{viewEnrollment.teacherId || "-"}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Progress</p><p className="text-sm">{viewEnrollment.progress || 0}%</p></div>
                <div><p className="text-sm font-medium text-gray-500">Last Accessed At</p><p className="text-sm">{formatDate(viewEnrollment.lastAccessedAt)}</p></div>
                <div className="col-span-2"><p className="text-sm font-medium text-gray-500">Remarks</p><p className="text-sm">{viewEnrollment.remarks || "-"}</p></div>
              </div>
            </div>
            <div className="flex justify-end px-4 sm:px-6 py-4" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
              <button onClick={handleCloseViewPopup} className="px-4 py-2 border rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.colors.card }}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <h2 className="text-lg font-semibold">{editingEnrollment ? "Edit Enrollment" : "Add Enrollment"}</h2>
              <button onClick={handleClosePopup}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              {editingEnrollment && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm"><strong>Enrollment Code:</strong> {editingEnrollment.enrollmentCode}</p>
                  <p className="text-sm"><strong>Student:</strong> {editingEnrollment.studentName} ({editingEnrollment.studentId})</p>
                  <p className="text-sm"><strong>Course:</strong> {editingEnrollment.courseName} ({editingEnrollment.courseCode})</p>
                </div>
              )}

              {!editingEnrollment && (
                <>
                  {/* Student and Course Selection for Add Enrollment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Student *</label>
                      <select 
                        value={formData.studentId} 
                        onChange={(e) => {
                          const student = students.find(s => s.studentId === e.target.value);
                          setFormData({ 
                            ...formData, 
                            studentId: e.target.value,
                            studentName: student ? student.name : "",
                            studentEmail: student ? student.email : ""
                          });
                        }} 
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="">Select Student</option>
                        {students.map((s) => <option key={s.studentId} value={s.studentId}>{s.name} ({s.studentId})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Course *</label>
                      <select 
                        value={formData.courseCode} 
                        onChange={(e) => {
                          const course = courses.find(c => c.courseCode === e.target.value);
                          setFormData({ 
                            ...formData, 
                            courseCode: e.target.value,
                            courseName: course ? course.courseName : "",
                            coursePrice: course ? course.price : ""
                          });
                        }} 
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="">Select Course</option>
                        {courses.map((c) => <option key={c.courseCode} value={c.courseCode}>{c.courseName} ({c.courseCode})</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Payment Details for Add Enrollment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Status</label>
                      <select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white">
                        {PAYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount Paid</label>
                      <input type="number" value={formData.amountPaid} onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="Enter amount paid" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Currency</label>
                      <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white">
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Method</label>
                      <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white">
                        <option value="">Select Payment Method</option>
                        <option value="CASH">Cash</option>
                        <option value="ONLINE">Online</option>
                        <option value="UPI">UPI</option>
                        <option value="CARD">Card</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Remarks</label>
                    <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full px-3 py-2 border rounded-md" rows="2" placeholder="Enter remarks" />
                  </div>
                </>
              )}

              {editingEnrollment && (
                <>
                  {/* Edit Enrollment Fields (existing) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Status</label>
                      <select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white">
                        {PAYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Enrollment Expire Date</label>
                      <input type="date" value={formData.enrollmentExpireDate} onChange={(e) => setFormData({ ...formData, enrollmentExpireDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Is Refunded</label>
                      <select value={formData.isRefunded} onChange={(e) => setFormData({ ...formData, isRefunded: e.target.value === 'true' })} className="w-full px-3 py-2 border rounded-md bg-white">
                        <option value={false}>No</option>
                        <option value={true}>Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Refunded Amount</label>
                      <input type="number" value={formData.refundedAmount} onChange={(e) => setFormData({ ...formData, refundedAmount: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="Enter refunded amount" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Refund Date</label>
                      <input type="date" value={formData.refundDate} onChange={(e) => setFormData({ ...formData, refundDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Remarks</label>
                    <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full px-3 py-2 border rounded-md" rows="3" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 px-4 sm:px-6 py-4" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
              <button onClick={handleClosePopup} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={editingEnrollment ? handleSave : handleAddSave} disabled={savingLoading} className="px-4 py-2 text-white rounded-md flex items-center gap-2" style={{ backgroundColor: theme.colors.primary }}>
                {savingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {savingLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {fullScreenLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg shadow-lg flex items-center gap-3 bg-white">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.colors.primary }} />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {isAssignTeacherOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-4xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.colors.card }}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <h2 className="text-lg font-semibold">Assign Teacher to Students</h2>
              <button onClick={handleCloseAssignTeacher}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course *</label>
                  <select value={assignTeacherData.courseCode} onChange={handleCourseChange} className="w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">Select Course</option>
                    {courses.map((c) => <option key={c.courseCode} value={c.courseCode}>{c.courseName} ({c.courseCode})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teacher *</label>
                  <select value={assignTeacherData.teacherId} onChange={handleTeacherChange} className="w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => <option key={t.teacherId} value={t.teacherId}>{t.name} ({t.teacherId})</option>)}
                  </select>
                </div>
              </div>
              <div>
                {!assignTeacherData.courseCode ? (
                  <div className="p-4 border rounded-md text-center">Please select a course first</div>
                ) : courseEnrollments.length === 0 ? (
                  <div className="p-4 border rounded-md text-center">No students enrolled</div>
                ) : (
                  <div className="space-y-4">
                    {/* Students WITHOUT Teacher Section */}
                    {studentsWithoutTeacher.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-green-700">
                            Students Without Teacher ({studentsWithoutTeacher.length})
                          </label>
                          <button 
                            type="button" 
                            onClick={() => {
                              const allIds = studentsWithoutTeacher.map(s => s.studentId);
                              setAssignTeacherData(prev => ({
                                ...prev,
                                studentIds: [...new Set([...prev.studentIds, ...allIds])]
                              }));
                            }} 
                            className="text-xs px-2 py-1 rounded border text-green-600 hover:bg-green-50"
                          >
                            Select All Unassigned
                          </button>
                        </div>
                        <div className="border rounded-md max-h-48 overflow-y-auto mb-3">
                          <div className="grid grid-cols-1 gap-1 p-2">
                            {studentsWithoutTeacher.map((enrollment) => (
                              <div 
                                key={enrollment.id} 
                                className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${assignTeacherData.studentIds.includes(enrollment.studentId) ? 'ring-2' : ''}`}
                                style={{ 
                                  backgroundColor: assignTeacherData.studentIds.includes(enrollment.studentId) 
                                    ? `${theme.colors.primary}20` 
                                    : '#ecfdf5',
                                  border: '1px solid #d1fae5'
                                }}
                                onClick={() => handleStudentSelect(enrollment.studentId)}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={assignTeacherData.studentIds.includes(enrollment.studentId)} 
                                  onChange={() => handleStudentSelect(enrollment.studentId)} 
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{enrollment.studentName}</div>
                                  <div className="text-xs text-gray-500">{enrollment.studentEmail}</div>
                                </div>
                                <span className="text-xs text-green-600 font-medium">Unassigned</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Students WITH Teacher Section */}
                    {studentsWithTeacher.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-blue-700">
                            Students With Teacher ({studentsWithTeacher.length})
                          </label>
                          <button 
                            type="button" 
                            onClick={() => {
                              const allIds = studentsWithTeacher.map(s => s.studentId);
                              setAssignTeacherData(prev => ({
                                ...prev,
                                studentIds: [...new Set([...prev.studentIds, ...allIds])]
                              }));
                            }} 
                            className="text-xs px-2 py-1 rounded border text-blue-600 hover:bg-blue-50"
                          >
                            Select All for Update
                          </button>
                        </div>
                        <div className="border rounded-md max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-1 gap-1 p-2">
                            {studentsWithTeacher.map((enrollment) => {
                              const assignedTeacher = teachers.find(t => t.teacherId === enrollment.teacherId);
                              return (
                                <div 
                                  key={enrollment.id} 
                                  className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${assignTeacherData.studentIds.includes(enrollment.studentId) ? 'ring-2' : ''}`}
                                  style={{ 
                                    backgroundColor: assignTeacherData.studentIds.includes(enrollment.studentId) 
                                      ? `${theme.colors.primary}20` 
                                      : '#eff6ff',
                                    border: '1px solid #dbeafe'
                                  }}
                                  onClick={() => handleStudentSelect(enrollment.studentId)}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={assignTeacherData.studentIds.includes(enrollment.studentId)} 
                                    onChange={() => handleStudentSelect(enrollment.studentId)} 
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{enrollment.studentName}</div>
                                    <div className="text-xs text-gray-500">{enrollment.studentEmail}</div>
                                  </div>
                                  <div className="text-xs text-blue-600 font-medium">
                                    {assignedTeacher?.name || assignedTeacher?.teacherName || enrollment.teacherId}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {assignTeacherData.studentIds.length > 0 && (
                      <div className="p-3 rounded-md" style={{ backgroundColor: theme.colors.secondary }}>
                        <p className="text-sm">
                          <strong>{assignTeacherData.studentIds.length}</strong> student(s) selected for teacher assignment
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-4 sm:px-6 py-4" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
              <button onClick={handleCloseAssignTeacher} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={handleAssignTeacher} disabled={assignLoading} className="px-4 py-2 text-white rounded-md flex items-center gap-2" style={{ backgroundColor: theme.colors.success }}>
                {assignLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {assignLoading ? "Assigning..." : "Assign Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
