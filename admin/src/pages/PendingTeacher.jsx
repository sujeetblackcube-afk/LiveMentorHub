import React, { useState, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown } from "lucide-react";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getTeachers,
  updateTeacherStatus,
  getAllCourses,
  updateTeacherCourse,
} from "../services/api";
const statusTypeMap = {
  APPROVED: "success",
  SUSPENDED: "warning",
  PENDING: "pending",
  REJECTED: "danger",
};

const Avatar = ({ name, image }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return image ? (
    <img src={image} alt={name} className="w-9 h-9 rounded-full object-cover" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
      {initials}
    </div>
  );
};

export default function PendingTeacher() {
  const [teachers, setteachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openStatusIndex, setOpenStatusIndex] = useState(null);
  const [selectedteachers, setSelectedteachers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const statusOptions = ["APPROVED", "SUSPENDED", "TERMINATED", "PENDING"];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showExportBar, setShowExportBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isAllotting, setIsAllotting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchteachers = async () => {
      setLoading(true);
      try {
        const params = { status: "PENDING", page: currentPage, limit: itemsPerPage };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (searchTerm) params.search = searchTerm;
        const response = await getTeachers(params);
        setteachers(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        setteachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchteachers();
  }, [startDate, endDate, currentPage, searchTerm]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        setCourses(response.data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setCourses([]);
      }
    };

    fetchCourses();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const filteredteachers = teachers;
  const paginatedTeachers = teachers;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (index, status) => {
    const teacher = paginatedTeachers[index];

    try {
      await updateTeacherStatus(teacher.teacherId, status);
      // If status changed to something other than PENDING, remove from list
      if (status !== "PENDING") {
        const updated = teachers.filter(
          (s) => s.teacherId !== teacher.teacherId,
        );
        setteachers(updated);
      } else {
        // Update local state if still PENDING
        const updated = teachers.map((s) =>
          s.teacherId === teacher.teacherId ? { ...s, status: status } : s,
        );
        setteachers(updated);
      }
      setOpenStatusIndex(null);
    } catch (err) {
      console.error("Failed to update status:", err);
      // Optionally show error to user
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedteachers((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id];
      // Check if all items are selected
      if (newSelection.length === filteredteachers.length && filteredteachers.length > 0) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedteachers([]);
      setSelectAll(false);
    } else {
      setSelectedteachers(filteredteachers.map((t) => t.teacherId));
      setSelectAll(true);
    }
  };

  // Download function for selected items (Excel only)
  const downloadSelectedExcel = (selectedIds) => {
    const selectedData = filteredteachers.filter((t) => selectedIds.includes(t.teacherId));
    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "teachers");
    XLSX.writeFile(wb, "selected_teachers.xlsx");
  };

  // Download function for Excel (fetches ALL records from server for export)
  const downloadExcel = async () => {
    try {
      const params = { status: "PENDING", limit: 100000 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await getTeachers(params);
      const allData = response.data || [];
      const dataToExport = selectedteachers.length > 0
        ? allData.filter((t) => selectedteachers.includes(t.teacherId))
        : allData;
      if (dataToExport.length === 0) { alert("No teachers to export"); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "teachers");
      XLSX.writeFile(wb, "teachers.xlsx");
    } catch (err) {
      console.error("Failed to download Excel:", err);
    }
  };

  // Download function for PDF (fetches ALL records from server for export)
  const downloadPDF = async () => {
    try {
      const params = { status: "PENDING", limit: 100000 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await getTeachers(params);
      const allData = response.data || [];
      const dataToExport = selectedteachers.length > 0
        ? allData.filter((t) => selectedteachers.includes(t.teacherId))
        : allData;
      if (dataToExport.length === 0) { alert("No teachers to export"); return; }
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Teachers List", 14, 15);
      const columns = ["ID", "Name", "Email", "Mobile", "Country", "Address", "Status"];
      const rows = dataToExport.map((teachers) => [
        teachers.teacherId, teachers.name, teachers.email,
        teachers.mobile, teachers.country, teachers.address, teachers.status,
      ]);
      autoTable(doc, { head: [columns], body: rows, startY: 25, styles: { fontSize: 9 }, headStyles: { fillColor: [22, 163, 74] } });
      doc.save("teachers.pdf");
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  // Handle download button click based on selection
  const handleDownload = () => {
    const selectedCount = selectedteachers.length;
    const totalCount = filteredteachers.length;

    if (selectedCount === 0) {
      // No selection - download Excel for all
      downloadExcel();
    } else if (selectedCount === totalCount && totalCount > 0) {
      // All selected - download both Excel and PDF
      downloadExcel();
      downloadPDF();
    } else {
      // Partial selection - download Excel only for selected
      downloadSelectedExcel(selectedteachers);
    }
  };

  const handleAllotCourseClick = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedCourse("");
    // Handle coursename properly - it could be array, string, or undefined
    const teacherCourses = teacher?.coursename;
    if (Array.isArray(teacherCourses) && teacherCourses.length > 0) {
      setSelectedCourses([...teacherCourses]);
    } else if (teacherCourses && typeof teacherCourses === "string") {
      setSelectedCourses([teacherCourses]);
    } else {
      setSelectedCourses([]);
    }
    setShowPopup(true);
  };

  const addCourse = () => {
    if (selectedCourse && !selectedCourses.includes(selectedCourse)) {
      setSelectedCourses([...selectedCourses, selectedCourse]);
      setSelectedCourse("");
    }
  };

  const removeCourse = (course) => {
    setSelectedCourses(selectedCourses.filter((c) => c !== course));
  };

  const handleAllotCourse = async () => {
    if (!selectedTeacher || selectedCourses.length === 0) return;

    setIsAllotting(true);
    try {
      await updateTeacherCourse(selectedTeacher.teacherId, selectedCourses);
      // Update local state
      const updatedTeachers = teachers.map((t) =>
        t.teacherId === selectedTeacher.teacherId
          ? { ...t, coursename: selectedCourses }
          : t,
      );
      setteachers(updatedTeachers);
      setShowPopup(false);
      setSelectedTeacher(null);
      setSelectedCourse("");
      setSelectedCourses([]);
    } catch (err) {
      console.error("Failed to allot course:", err);
      alert("Failed to allot course. Please try again.");
    } finally {
      setIsAllotting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-800">
            Pending teachers
          </h1>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            placeholder="Search teachers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-full"
          />
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="max-w-10xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between mb-6">
        {/* Date Range */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <div>
            <label className="text-xs text-gray-500 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <button
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 w-full sm:w-auto"
            onClick={() => {
              
                downloadExcel();
            }}
          >
            Download Excel
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 w-full sm:w-auto"
            onClick={() => {
              downloadPDF();
            }}
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto h-[70vh] overflow-y-auto relative">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-center sticky top-0 z-10">
              <tr className="whitespace-nowrap">
                <th className="px-8 py-4">S.no</th>
                <th className="px-8 py-4">Teachers</th>
                <th className="px-8 py-4">Teacher ID</th>
                <th className="px-8 py-4">Email</th>
                <th className="px-8 py-4">Mobile</th>
                <th className="px-8 py-4">Country</th>
                <th className="px-8 py-4">Alloted Course</th>
                <th className="px-8 py-4">Address</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">
                  <div className="flex items-center gap-2">
                    <span>Select All</span>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-green-600 cursor-pointer"
                    />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-8 py-5 text-center text-gray-500"
                  >
                    Loading teachers...
                  </td>
                </tr>
              ) : paginatedTeachers.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-8 py-5 text-center text-gray-500"
                  >
                    No Pending teachers found.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((s, i) => (
                  <tr
                    key={s.teacherId}
                    className="border-t hover:bg-gray-50 whitespace-nowrap"
                  >
                    <td className="px-8 py-5">
                      {(currentPage - 1) * itemsPerPage + i + 1}
                    </td>

                    <td className="px-8 py-5">
                      <div
                        onClick={() =>
                          navigate(`/teachers/profile/${s.teacherId}`)
                        }
                        className="flex items-center gap-4 cursor-pointer"
                      >
                        <Avatar name={s.name} image={s.profileImage} />
                        <span className="font-medium text-gray-800 hover:text-indigo-600">
                          {s.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5 font-medium">{s.teacherId}</td>
                    <td className="px-8 py-5 text-gray-500">{s.email}</td>
                    <td className="px-8 py-5 text-gray-500">{s.mobile}</td>
                    <td className="px-8 py-5 text-gray-500">{s.country}</td>
                    <td className="px-8 py-5">
                      <span className="text-gray-600">
                        {s?.coursename
                          ? Array.isArray(s.coursename)
                            ? s.coursename.length > 0
                              ? s.coursename.join(", ")
                              : "No courses"
                            : s.coursename
                          : "No courses"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-gray-500">{s.address}</td>

                    <td className="relative px-8 py-5">
                      <button
                        onClick={() =>
                          setOpenStatusIndex(openStatusIndex === i ? null : i)
                        }
                        className="flex items-center gap-1"
                      >
                        <Badge
                          text={s.status}
                          type={statusTypeMap[s.status] || "default"}
                        />

                        <ChevronDown className="w-3 h-3 text-green-400" />
                      </button>

                      {openStatusIndex === i && (
                        <div className="absolute z-10 mt-2 w-36 bg-white border rounded-md shadow">
                          {statusOptions.map((status) => (
                            <div
                              key={status}
                              onClick={() => handleStatusChange(i, status)}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                            >
                              {status}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-5">
                      <input
                        type="checkbox"
                        checked={selectedteachers.includes(s.teacherId)}
                        onChange={() => toggleSelectOne(s.teacherId)}
                        className="w-4 h-4"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-600">
          {/* Left */}
          <span>
            Page {currentPage} of {totalPages}
          </span>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              &lt;
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page ? "bg-indigo-600 text-white" : ""
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <h2 className="text-xl font-bold text-white">
                Allot Course to {selectedTeacher?.name}
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Select Course
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Choose a course...</option>
                    {courses && courses.length > 0 ? (
                      courses
                        .filter(
                          (course) =>
                            !selectedCourses.includes(course.courseName),
                        )
                        .map((course) => (
                          <option
                            key={course.courseCode}
                            value={course.courseName}
                          >
                            {course.courseName}
                          </option>
                        ))
                    ) : (
                      <option disabled>No courses available</option>
                    )}
                  </select>
                  <button
                    onClick={addCourse}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    disabled={!selectedCourse}
                  >
                    Add
                  </button>
                </div>
              </div>
              {selectedCourses.length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Allotted Courses ({selectedCourses.length})
                  </label>
                  <div className="max-h-40 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                    {selectedCourses.map((course, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 px-3 bg-white rounded-md mb-2 shadow-sm"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {course}
                        </span>
                        <button
                          onClick={() => removeCourse(course)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    No courses allotted yet. Please select a course from the
                    dropdown above.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setSelectedTeacher(null);
                    setSelectedCourses([]);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAllotCourse}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  disabled={selectedCourses.length === 0 || isAllotting}
                >
                  {isAllotting ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Allotting...
                    </>
                  ) : (
                    `Allot ${selectedCourses.length > 0 ? `${selectedCourses.length} Course${selectedCourses.length > 1 ? "s" : ""}` : "Courses"}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
