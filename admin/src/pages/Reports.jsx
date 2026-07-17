
import React, { useState, useEffect } from "react";
import { Download, Search, Eye, User, BookOpen, Video, FileText, Users, GraduationCap, UserCheck } from "lucide-react";
import {
  getTeachers,
  getTeacherById,
  getAllParentsReport,
  getStudentReport,
  getStudentReportById,
  getParentReportById,
  getAllCourses
} from "../services/api";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("teachers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data states
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentsData, setParentsData] = useState({ data: [], summary: {} });
  const [studentsData, setStudentsData] = useState({ data: [], summary: {} });
  
  // Search/filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [courses, setCourses] = useState([]);

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      if (response.success || response.status) {
        setCourses(response.data || response.courses || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // Fetch data based on report type
  useEffect(() => {
    if (reportType === "parents") {
      fetchParents();
    } else if (reportType === "students") {
      fetchStudents();
    }
  }, [reportType, statusFilter, courseFilter]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await getTeachers();
      if (response.status) {
        setTeachers(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherDetails = async (teacherId) => {
    try {
      setLoading(true);
      const response = await getTeacherById(teacherId);
      if (response.status) {
        setSelectedTeacher(response.data);
      }
    } catch (err) {
      console.error("Error fetching teacher details:", err);
      setError("Failed to fetch teacher details");
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await getAllParentsReport(params);
      if (response.success) {
        setParentsData({
          data: response.data || [],
          summary: response.summary || {}
        });
      }
    } catch (err) {
      console.error("Error fetching parents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (courseFilter) params.courseCode = courseFilter;
      
      const response = await getStudentReport(params);
      if (response.success) {
        setStudentsData({
          data: response.data || [],
          summary: response.summary || {}
        });
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherClick = (teacher) => {
    fetchTeacherDetails(teacher.teacherId);
  };

  const closeTeacherModal = () => {
    setSelectedTeacher(null);
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      setLoading(true);
      const response = await getStudentReportById(studentId);
      if (response.success) {
        setSelectedStudent(response.data);
      }
    } catch (err) {
      console.error("Error fetching student details:", err);
      setError("Failed to fetch student details");
    } finally {
      setLoading(false);
    }
  };

  const fetchParentDetails = async (parentId) => {
    try {
      setLoading(true);
      const response = await getParentReportById(parentId);
      if (response.success) {
        setSelectedParent(response.data);
      }
    } catch (err) {
      console.error("Error fetching parent details:", err);
      setError("Failed to fetch parent details");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    fetchStudentDetails(student.studentId);
  };

  const handleParentClick = (parent) => {
    fetchParentDetails(parent.parentId);
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
  };

  const closeParentModal = () => {
    setSelectedParent(null);
  };

  // Export table data
  const handleExport = () => {
    const exportData = filteredData.map(item => {
      if (reportType === "teachers") {
        return { Name: item.name, Email: item.email, Mobile: item.mobile, Courses: item.coursename?.length || 0, Status: item.status, CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "" };
      } else if (reportType === "parents") {
        return { Name: item.name, Email: item.email, Mobile: item.mobile, StudentCount: item.studentCount || 0, Status: item.status, CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "" };
      } else {
        return { Name: item.name, Email: item.email, Mobile: item.mobile, Enrollments: item.enrollments?.length || 0, Status: item.status, CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "" };
      }
    });
    if (!exportData || exportData.length === 0) { alert("No data to export"); return; }
    const headers = Object.keys(exportData[0]);
    const csvContent = [headers.join(","), ...exportData.map(row => headers.map(header => { const value = row[header]; const stringValue = String(value || ""); if (stringValue.includes(",") || stringValue.includes('"')) { return `"${stringValue.replace(/"/g, '""')}"`; } return stringValue; }).join(",") )].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Export student details with all progress data
  const handleExportStudentDetails = () => {
    if (!selectedStudent) return;
    
    // Build CSV content
    let csvContent = "";
    
    // Basic Info Section
    csvContent += "Student Information\n";
    csvContent += `Name,${selectedStudent.name || ""}\n`;
    csvContent += `Email,${selectedStudent.email || ""}\n`;
    csvContent += `Mobile,${selectedStudent.mobile || ""}\n`;
    csvContent += `Status,${selectedStudent.status || ""}\n`;
    csvContent += `Parent Name,${selectedStudent.parentName || "N/A"}\n`;
    csvContent += `Parent Mobile,${selectedStudent.parentMobile || "N/A"}\n`;
    csvContent += `Total Enrollments,${selectedStudent.totalEnrollments || 0}\n`;
    csvContent += `Total Spent,${selectedStudent.totalSpent || 0}\n`;
    
    // Test Progress Section
    csvContent += "\nTest Progress\n";
    csvContent += `Tests Allotted,${selectedStudent.testsAllotted || 0}\n`;
    csvContent += `Tests Submitted,${selectedStudent.testsSubmitted || 0}\n`;
    csvContent += `Tests Not Submitted,${selectedStudent.testsNotSubmitted || 0}\n`;
    
    // Assignment Progress Section
    csvContent += "\nAssignment Progress\n";
    csvContent += `Assignments Allotted,${selectedStudent.assignmentsAllotted || 0}\n`;
    csvContent += `Assignments Submitted,${selectedStudent.assignmentsSubmitted || 0}\n`;
    csvContent += `Assignments Not Submitted,${selectedStudent.assignmentsNotSubmitted || 0}\n`;
    
    // Submitted Tests Section
    if (selectedStudent.submittedTests && selectedStudent.submittedTests.length > 0) {
      csvContent += "\nSubmitted Tests\n";
      csvContent += "Test ID,Status,Marks,Percentage,Submitted At\n";
      selectedStudent.submittedTests.forEach(test => {
        csvContent += `${test.testId || ""},${test.status || ""},${test.obtainedMarks || 0},${test.percentage?.toFixed(1) || 0},${test.submittedAt ? new Date(test.submittedAt).toLocaleDateString() : "-"}\n`;
      });
    }
    
    // Submitted Assignments Section
    if (selectedStudent.submittedAssignments && selectedStudent.submittedAssignments.length > 0) {
      csvContent += "\nSubmitted Assignments\n";
      csvContent += "Assignment ID,Status,Marks,Percentage,Submitted At\n";
      selectedStudent.submittedAssignments.forEach(assignment => {
        csvContent += `${assignment.assignmentId || ""},${assignment.status || ""},${assignment.obtainedMarks || 0},${assignment.percentage?.toFixed(1) || 0},${assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : "-"}\n`;
      });
    }
    
    // Enrollments Section
    csvContent += "\nEnrollments\n";
    csvContent += "Course Name,Enrollment Date,Expire Date,Amount Paid,Payment Status,Progress,Status\n";
    if (selectedStudent.enrollments && selectedStudent.enrollments.length > 0) {
      selectedStudent.enrollments.forEach(e => {
        csvContent += `${e.courseName || ""},${e.enrollmentDate ? new Date(e.enrollmentDate).toLocaleDateString() : ""},${e.enrollmentExpireDate ? new Date(e.enrollmentExpireDate).toLocaleDateString() : ""},${e.amountPaid || 0},${e.paymentStatus || ""},${e.progress || 0},${e.status || ""}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `student_${selectedStudent.name}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Export parent details
  const handleExportParentDetails = () => {
    if (!selectedParent) return;
    const students = selectedParent.students?.map(s => ({ Name: s.name, Email: s.email, Mobile: s.mobile, Status: s.status, Enrollments: s.enrollments?.length || 0 })) || [];
    const parentInfo = ["Field,Value", `Name,${selectedParent.parent?.name || ""}`, `Email,${selectedParent.parent?.email || ""}`, `Mobile,${selectedParent.parent?.mobile || ""}`, `Status,${selectedParent.parent?.status || ""}`, `TotalStudents,${selectedParent.summary?.totalStudents || 0}`, `TotalEnrollments,${selectedParent.summary?.totalEnrollments || 0}`, `PaidEnrollments,${selectedParent.summary?.paidEnrollments || 0}`, `TotalRevenue,${selectedParent.summary?.totalRevenue || 0}`, "", "Students", "Name,Email,Mobile,Status,Enrollments", ...students.map(s => Object.values(s).join(","))].join("\n");
    const blob = new Blob([parentInfo], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `parent_${selectedParent.parent?.name}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Export teacher details
  const handleExportTeacherDetails = () => {
    if (!selectedTeacher) return;
    const teacherInfo = ["Field,Value", `Name,${selectedTeacher.teacher?.name || ""}`, `Email,${selectedTeacher.teacher?.email || ""}`, `Mobile,${selectedTeacher.teacher?.mobile || ""}`, `Status,${selectedTeacher.teacher?.status || ""}`, `LiveSessions,${selectedTeacher.liveSessionCount || 0}`, `Assignments,${selectedTeacher.assignmentCount || 0}`, `Enrollments,${selectedTeacher.enrollmentCount || 0}`, `Courses,${selectedTeacher.teacher?.coursename?.length || 0}`].join("\n");
    const blob = new Blob([teacherInfo], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `teacher_${selectedTeacher.teacher?.name}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Filter data based on search
  const getFilteredData = () => {
    let data = [];
    
    if (reportType === "teachers") {
      data = teachers;
    } else if (reportType === "parents") {
      data = parentsData.data;
    } else if (reportType === "students") {
      data = studentsData.data;
    }

    if (searchTerm) {
      data = data.filter(item => {
        const name = item.name?.toLowerCase() || "";
        const email = item.email?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
      });
    }

    return data;
  };

  const filteredData = getFilteredData();

  // Render summary cards based on report type
  const renderSummaryCards = () => {
    if (reportType === "teachers") {
      const summary = {
        total: teachers.length,
        approved: teachers.filter(t => t.status === "APPROVED").length,
        pending: teachers.filter(t => t.status === "PENDING").length,
        suspended: teachers.filter(t => t.status === "SUSPENDED").length,
      };
      return (
        <>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Teachers</p>
            <h2 className="text-2xl font-bold">{summary.total}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Approved</p>
            <h2 className="text-2xl font-bold text-green-600">{summary.approved}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Pending</p>
            <h2 className="text-2xl font-bold text-yellow-500">{summary.pending}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Suspended</p>
            <h2 className="text-2xl font-bold text-red-500">{summary.suspended}</h2>
          </div>
        </>
      );
    } else if (reportType === "parents") {
      const summary = parentsData.summary;
      return (
        <>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Parents</p>
            <h2 className="text-2xl font-bold">{summary.totalParents || 0}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Approved Parents</p>
            <h2 className="text-2xl font-bold text-green-600">{summary.approvedParents || 0}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Students</p>
            <h2 className="text-2xl font-bold text-blue-600">{summary.totalStudents || 0}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Suspended</p>
            <h2 className="text-2xl font-bold text-red-500">{summary.suspendedParents || 0}</h2>
          </div>
        </>
      );
    } else if (reportType === "students") {
      const summary = studentsData.summary;
      return (
        <>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Students</p>
            <h2 className="text-2xl font-bold">{summary.totalStudents || 0}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Enrollments</p>
            <h2 className="text-2xl font-bold text-blue-600">{summary.totalEnrollments || 0}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Paid Enrollments</p>
            <h2 className="text-2xl font-bold text-green-600">{summary.paidEnrollments || 0}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <h2 className="text-2xl font-bold text-yellow-500">₹{summary.totalRevenue || 0}</h2>
          </div>
        </>
      );
    }
  };

  // Render table based on report type
  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      );
    }

    if (reportType === "teachers") {
      return (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Courses</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-3 text-center text-gray-500">No teachers found</td>
              </tr>
            ) : (
              filteredData.map((teacher, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{teacher.name}</td>
                  <td className="p-3">{teacher.email}</td>
                  <td className="p-3">{teacher.mobile}</td>
                  <td className="p-3">{teacher.coursename?.length || 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      teacher.status === "APPROVED" ? "bg-green-100 text-green-600" :
                      teacher.status === "PENDING" ? "bg-yellow-100 text-yellow-600" :
                      teacher.status === "SUSPENDED" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleTeacherClick(teacher)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    } else if (reportType === "parents") {
      return (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Students</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-500">No parents found</td>
              </tr>
            ) : (
              filteredData.map((parent, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{parent.name}</td>
                  <td className="p-3">{parent.email}</td>
                  <td className="p-3">{parent.mobile}</td>
                  <td className="p-3">{parent.studentCount || 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      parent.status === "APPROVED" ? "bg-green-100 text-green-600" :
                      parent.status === "SUSPENDED" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {parent.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(parent.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleParentClick(parent)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    } else if (reportType === "students") {
      return (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Enrollments</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-500">No students found</td>
              </tr>
            ) : (
              filteredData.map((student, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{student.name}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">{student.mobile}</td>
                  <td className="p-3">{student.enrollments?.length || 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      student.status === "APPROVED" ? "bg-green-100 text-green-600" :
                      student.status === "SUSPENDED" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleStudentClick(student)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">User Management / Reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white rounded-xl shadow p-4 grid grid-cols-1 gap-4 mb-6 ${reportType === "students" ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
        {/* Report Type */}
        <div>
          <label className="text-sm text-gray-500">Select Report</label>
          <select
            className="w-full mt-1 border rounded-lg p-2"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setSearchTerm("");
              setStatusFilter("");
              setCourseFilter("");
            }}
          >
            <option value="teachers">Teachers</option>
            <option value="parents">Parents</option>
            <option value="students">Students</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="text-sm text-gray-500">Search</label>
          <div className="relative mt-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-8 border rounded-lg p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-sm text-gray-500">Status</label>
          <select
            className="w-full mt-1 border rounded-lg p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>

        {/* Course Filter (Students Only) */}
        {reportType === "students" && (
          <div>
            <label className="text-sm text-gray-500">Course</label>
            <select
              className="w-full mt-1 border rounded-lg p-2"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((c, i) => (
                <option key={i} value={c.courseCode}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Export Button */}
        <div className="flex items-end">
          <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {renderSummaryCards()}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-4">
          {reportType === "teachers" && "Teachers Report"}
          {reportType === "parents" && "Parents Report"}
          {reportType === "students" && "Students Report"}
        </h3>
        <div className="overflow-auto max-h-[500px]">
          {renderTable()}
        </div>
      </div>

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Teacher Details</h2>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportTeacherDetails} className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-50 mr-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={closeTeacherModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Teacher Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedTeacher.teacher?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedTeacher.teacher?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{selectedTeacher.teacher?.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedTeacher.teacher?.status === "APPROVED" ? "bg-green-100 text-green-600" :
                    selectedTeacher.teacher?.status === "PENDING" ? "bg-yellow-100 text-yellow-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {selectedTeacher.teacher?.status}
                  </span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Live Sessions</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{selectedTeacher.liveSessionCount || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <p className="text-sm text-gray-600">Assignments</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{selectedTeacher.assignmentCount || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-gray-600">Enrollments</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{selectedTeacher.enrollmentCount || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-gray-600">Courses</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{selectedTeacher.teacher?.coursename?.length || 0}</p>
                </div>
              </div>

              {/* Subscriptions */}
              <div>
                <h3 className="font-semibold mb-3">Subscriptions</h3>
                {selectedTeacher.subscriptions?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTeacher.subscriptions.map((sub, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{sub.planName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{sub.price}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              sub.status === "active" ? "bg-green-100 text-green-600" :
                              sub.status === "expired" ? "bg-red-100 text-red-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <p>Payment: {sub.paymentStatus} | Transaction: {sub.transactionId || "N/A"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No subscriptions found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Student Details</h2>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportStudentDetails} className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-50 mr-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={closeStudentModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{selectedStudent.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedStudent.status === "APPROVED" ? "bg-green-100 text-green-600" :
                    selectedStudent.status === "SUSPENDED" ? "bg-red-100 text-red-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {selectedStudent.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent Name</p>
                  <p className="font-medium">{selectedStudent.parentName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent Mobile</p>
                  <p className="font-medium">{selectedStudent.parentMobile || "N/A"}</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Enrollments</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.totalEnrollments || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{selectedStudent.totalSpent || 0}</p>
                </div>
              </div>

              {/* Test & Assignment Progress */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Test & Assignment Progress</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Tests Allotted</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedStudent.testsAllotted || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Tests Submitted</p>
                    <p className="text-2xl font-bold text-green-600">{selectedStudent.testsSubmitted || 0}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Tests Not Submitted</p>
                    <p className="text-2xl font-bold text-red-600">{selectedStudent.testsNotSubmitted || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Assignments Allotted</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedStudent.assignmentsAllotted || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Assignments Submitted</p>
                    <p className="text-2xl font-bold text-green-600">{selectedStudent.assignmentsSubmitted || 0}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Assignments Not Submitted</p>
                    <p className="text-2xl font-bold text-red-600">{selectedStudent.assignmentsNotSubmitted || 0}</p>
                  </div>
                </div>
              </div>

              {/* Submitted Tests Table */}
              {selectedStudent.submittedTests && selectedStudent.submittedTests.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Submitted Tests</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Test ID</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Marks</th>
                        <th className="p-2 text-left">Percentage</th>
                        <th className="p-2 text-left">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.submittedTests.map((test, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">{test.testId}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${test.status === 'GRADED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              {test.status}
                            </span>
                          </td>
                          <td className="p-2">{test.obtainedMarks || 0}</td>
                          <td className="p-2">{test.percentage?.toFixed(1) || 0}%</td>
                          <td className="p-2">{test.submittedAt ? new Date(test.submittedAt).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Submitted Assignments Table */}
              {selectedStudent.submittedAssignments && selectedStudent.submittedAssignments.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Submitted Assignments</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Assignment ID</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Marks</th>
                        <th className="p-2 text-left">Percentage</th>
                        <th className="p-2 text-left">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.submittedAssignments.map((assignment, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">{assignment.assignmentId}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${assignment.status === 'checked' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              {assignment.status}
                            </span>
                          </td>
                          <td className="p-2">{assignment.obtainedMarks || 0}</td>
                          <td className="p-2">{assignment.percentage?.toFixed(1) || 0}%</td>
                          <td className="p-2">{assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Enrollments */}
              <div>
                <h3 className="font-semibold mb-3">Enrollments</h3>
                {selectedStudent.enrollments?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.enrollments.map((enrollment, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{enrollment.courseName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(enrollment.enrollmentDate).toLocaleDateString()} - {new Date(enrollment.enrollmentExpireDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{enrollment.amountPaid || 0}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              enrollment.paymentStatus === "PAID" ? "bg-green-100 text-green-600" :
                              "bg-red-100 text-red-600"
                            }`}>
                              {enrollment.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <p>Progress: {enrollment.progress || 0}% | Status: {enrollment.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No enrollments found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parent Details Modal */}
      {selectedParent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Parent Details</h2>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportParentDetails} className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-50 mr-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={closeParentModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Parent Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedParent.parent?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedParent.parent?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{selectedParent.parent?.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedParent.parent?.status === "APPROVED" ? "bg-green-100 text-green-600" :
                    selectedParent.parent?.status === "SUSPENDED" ? "bg-red-100 text-red-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {selectedParent.parent?.status}
                  </span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Students</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{selectedParent.summary?.totalStudents || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <p className="text-sm text-gray-600">Enrollments</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{selectedParent.summary?.totalEnrollments || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-gray-600">Paid</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{selectedParent.summary?.paidEnrollments || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">₹{selectedParent.summary?.totalRevenue || 0}</p>
                </div>
              </div>

              {/* Students */}
              <div>
                <h3 className="font-semibold mb-3">Students</h3>
                {selectedParent.students?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedParent.students.map((student, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">
                              {student.email} | {student.mobile}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            student.status === "APPROVED" ? "bg-green-100 text-green-600" :
                            student.status === "SUSPENDED" ? "bg-red-100 text-red-600" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {student.status}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Enrollments: {student.enrollments?.length || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No students found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

