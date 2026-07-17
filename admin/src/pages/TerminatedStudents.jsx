import React, { useState, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown } from "lucide-react";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getStudents,
  updateStudentStatus,
  BACKEND_BASE_URL,
} from "../services/api";
import { theme } from "../theme";

const Avatar = ({ name, image }) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "";

  // Prepend backend URL if image exists and doesn't already have full URL
  const fullImageUrl = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_BASE_URL}${image}`
    : null;

  return fullImageUrl ? (
    <img
      src={fullImageUrl}
      alt={name}
      className="w-9 h-9 rounded-full object-cover"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
      {initials}
    </div>
  );
};

export default function TerminatedStudent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openStatusIndex, setOpenStatusIndex] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const statusOptions = ["TERMINATED"];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showExportBar, setShowExportBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const location = useLocation();

  const fetchTerminatedStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { 
        status: "TERMINATED",
        page: currentPage,
        limit: itemsPerPage
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.search = searchTerm;
      const response = await getStudents(params);
      setStudents(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      setError("Failed to fetch terminated students");
      console.error(err);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerminatedStudents();
  }, [startDate, endDate, currentPage, searchTerm]);

  // Reset page when search or date filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const filteredStudents = students;
  const paginatedStudents = students;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const mapStudentForExport = (student) => ({
    "Student ID": student.studentId || "-",
    "Name": student.name || "-",
    "Email": student.email || "-",
    "Mobile": student.mobile || "-",
    "Gender": student.gender || "-",
    "DOB": student.dateOfBirth || "-",
    "Parent Name": student.parentName || "-",
    "Parent Email": student.parentEmail || "-",
    "Parent Mobile": student.parentMobile || "-",
    "Guardian Rel": student.guardianRelationship || "-",
    "Address": student.address || "-",
    "Country": student.country || "-",
    "School Name": student.schoolName || "-",
    "Board": student.board || "-",
    "Class/Grade": student.classGrade || "-",
    "Subjects Required": Array.isArray(student.subjectsRequired) ? student.subjectsRequired.join(", ") : (student.subjectsRequired || "-"),
    "Tuition Type": student.tuitionType || "-",
    "Preferred Timing": student.preferredTiming || "-",
    "Preferred Days": student.preferredDays || "-",
    "Last Exam %": student.lastExamPercentage || "-",
    "Areas of Improvement": student.areasOfImprovement || "-",
    "Special Needs": student.specialLearningNeeds || "-",
    "Device Available": Array.isArray(student.deviceAvailable) ? student.deviceAvailable.join(", ") : (student.deviceAvailable || "-"),
    "Internet": student.internetConnectivity || "-",
    "Status": student.status || "-",
    "Enrolled Courses": Array.isArray(student.enrollments) ? student.enrollments.map(e => e.courseName).join(", ") : "-"
  });

  const downloadExcel = async () => {
    setLoading(true);
    try {
      const params = { status: "TERMINATED" };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.search = searchTerm;
      const response = await getStudents(params);
      const allStudents = response.data || [];

      const dataToExport =
        selectedStudents.length > 0
          ? allStudents.filter((s) =>
              selectedStudents.includes(s.studentId),
            )
          : allStudents;

      if (dataToExport.length === 0) {
        alert("No students selected");
        return;
      }

      const formattedData = dataToExport.map(mapStudentForExport);
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "TerminatedStudents");
      XLSX.writeFile(wb, "terminated_students.xlsx");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export data");
    } finally {
      setLoading(false);
    }
  };


  const downloadPDF = async () => {
    setLoading(true);
    try {
      const params = { status: "TERMINATED" };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.search = searchTerm;
      const response = await getStudents(params);
      const allStudents = response.data || [];

      const dataToExport =
        selectedStudents.length > 0
          ? allStudents.filter((s) => selectedStudents.includes(s.studentId))
          : allStudents;

      if (dataToExport.length === 0) {
        alert("No students selected");
        return;
      }

      // Using A0 landscape gives a massive canvas so all 26 columns fit beautifully
      const doc = new jsPDF({ orientation: "landscape", format: "a0" });
      
      doc.setFontSize(28);
      doc.setTextColor(33, 37, 41);
      doc.text("Terminated Students List", 14, 25);
      
      doc.setFontSize(16);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);

      const formattedData = dataToExport.map(mapStudentForExport);
      
      if (formattedData.length > 0) {
        // Export ALL columns to match Excel exactly
        const columns = Object.keys(formattedData[0]);
        const rows = formattedData.map((obj) => Object.values(obj));

        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 50,
          theme: 'grid',
          styles: { 
            fontSize: 12, 
            cellPadding: 4, 
            overflow: 'linebreak',
            valign: 'middle'
          },
          headStyles: { 
            fillColor: [22, 163, 74], 
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          margin: { top: 25, right: 10, bottom: 15, left: 10 }
        });
      }

      doc.save("terminated_students.pdf");
    } catch (err) {
      console.error("Export PDF failed:", err);
      alert("Failed to export PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (index, status) => {
    const student = filteredStudents[index];
    try {
      await updateStudentStatus(student.studentId, status);
      // If status changed to something other than TERMINATED, remove from list
      if (status !== "TERMINATED") {
        const updated = students.filter(
          (s) => s.studentId !== student.studentId,
        );
        setStudents(updated);
      } else {
        // Update local state if still TERMINATED
        const updated = students.map((s) =>
          s.studentId === student.studentId ? { ...s, status: status } : s,
        );
        setStudents(updated);
      }
      setOpenStatusIndex(null);
    } catch (err) {
      console.error("Failed to update status:", err);
      // Optionally show error to user
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudents([]);
    } else {
      const allIds = filteredStudents.map((s) => s.studentId);
      setSelectedStudents(allIds);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-800">
            Terminated Students
          </h1>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            placeholder="Search student"
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
        <div className="overflow-x-auto h-[80vh] overflow-y-auto relative">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-center sticky top-0 z-10">
              <tr className="whitespace-nowrap">
                <th className="px-8 py-4">S.No</th>
                <th className="px-8 py-4">Student</th>
                <th className="px-8 py-4">Student ID</th>
                <th className="px-8 py-4">Email</th>
                <th className="px-8 py-4">Mobile</th>
                <th className="px-8 py-4">
                  Parent Name
                </th>
                <th className="px-8 py-4">
                  Country
                </th>
                <th className="px-8 py-4">
                  Address
                </th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <span>Select All</span>
                    <input
                      type="checkbox"
                      checked={
                        filteredStudents.length > 0 &&
                        selectedStudents.length === filteredStudents.length
                      }
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
                  <td colSpan="10" className="py-6 text-center text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-6 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, i) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + i;

                  return (
                    <tr
                      key={s.studentId}
                      className="border-t hover:bg-gray-50 align-top"
                    >
                      <td className="px-8 py-4 whitespace-nowrap text-center">{globalIndex + 1}</td>

                      <td className="px-8 py-4 whitespace-nowrap">
                        <div
                          onClick={() =>
                            navigate(`/students/profile/${s.studentId}`)
                          }
                          className="flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <Avatar name={s.name} image={s.profileImage} />
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium whitespace-nowrap text-center">{s.studentId}</td>

                      <td className="px-4 py-4 text-gray-600 whitespace-nowrap text-center">
                        {s.email}
                      </td>

                      <td className="px-4 py-4 text-gray-600 whitespace-nowrap text-center">
                        {s.mobile}
                      </td>

                      <td className="px-4 py-4 text-gray-600 hidden sm:table-cell whitespace-nowrap text-center">
                        {s.parentName || "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-600 hidden sm:table-cell whitespace-nowrap text-center">
                        {s.country}
                      </td>

                      <td className="px-4 py-4 text-gray-600 break-words hidden sm:table-cell min-w-[250px] text-center">
                        {s.address}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4 relative whitespace-nowrap text-center">
                        <button
                          onClick={() =>
                            setOpenStatusIndex(
                              openStatusIndex === globalIndex
                                ? null
                                : globalIndex,
                            )
                          }
                          className="flex items-center gap-1 mx-auto"
                        >
                          <Badge
                            text={s.status}
                            type={
                              s.status === "APPROVED"
                                ? "success"
                                : s.status === "SUSPENDED"
                                  ? "warning"
                                  : "danger"
                            }
                          />
                          
                        </button>

                        
                      </td>

                      {/* APPROVED CHECK */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(s.studentId)}
                          onChange={() => toggleSelectOne(s.studentId)}
                          className="w-5 h-5 accent-green-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
}
