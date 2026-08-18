import "./student.css";
import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";
import Avatar from "../../components/Avatar";
import Badge from "../../components/Badge";
import Pagination from "../../components/Pagination";
import { FileDownloadZone } from "../../components/FileDownloadZone";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getStudents, updateStudentStatus } from "../../services/api";

const STATUS_OPTIONS = ["APPROVED", "SUSPENDED", "TERMINATED"];
const ITEMS_PER_PAGE = 10;

export default function TerminatedStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openStatusIndex, setOpenStatusIndex] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchTerminatedStudents = async () => {
    setLoading(true);
    try {
      const response = await getStudents({ status: "TERMINATED" });
      setStudents(response.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerminatedStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.studentId?.toString().includes(term) ||
      s.mobile?.includes(term);

    const matchesDate =
      (!startDate || new Date(s.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(s.createdAt) <= new Date(endDate));

    return matchesSearch && matchesDate;
  });

  useEffect(() => {
    setTotalPages(Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1);
  }, [filteredStudents]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const mapStudentForExport = useCallback((student) => ({
    "Student ID": student.studentId || "-",
    "Name": student.name || "-",
    "Email": student.email || "-",
    "Mobile": student.mobile || "-",
    "Parent Name": student.parentName || "-",
    "Country": student.country || "-",
    "Address": student.address || "-",
    "Status": student.status || "-",
  }), []);

  const downloadExcel = async () => {
    const dataToExport =
      selectedStudents.length > 0
        ? filteredStudents.filter((s) => selectedStudents.includes(s.studentId))
        : filteredStudents;

    if (dataToExport.length === 0) {
      throw new Error("No terminated students available to export");
    }

    const formattedData = dataToExport.map(mapStudentForExport);
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Terminated Students");
    XLSX.writeFile(wb, "Terminated_Students_Report.xlsx");
  };

  const downloadPDF = async () => {
    const dataToExport =
      selectedStudents.length > 0
        ? filteredStudents.filter((s) => selectedStudents.includes(s.studentId))
        : filteredStudents;

    if (dataToExport.length === 0) {
      throw new Error("No terminated students available to export");
    }

    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.setTextColor(13, 31, 92);
    doc.text("Terminated Students Report", 14, 15);

    const tableColumn = ["S.No", "ID", "Name", "Email", "Mobile", "Parent Name", "Country", "Status"];
    const tableRows = dataToExport.map((s, index) => [
      index + 1,
      s.studentId || "-",
      s.name || "-",
      s.email || "-",
      s.mobile || "-",
      s.parentName || "-",
      s.country || "-",
      s.status || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: "grid",
      headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255] },
    });

    doc.save("Terminated_Students_Report.pdf");
  };

  const handleStatusChange = async (index, status) => {
    const student = filteredStudents[index];
    try {
      await updateStudentStatus(student.studentId, status);
      setStudents((prev) => prev.filter((s) => s.studentId !== student.studentId));
      setOpenStatusIndex(null);
    } catch (err) {}
  };

  const toggleSelectOne = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Search Header */}
      <div className="max-w-10xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Terminated Students</h1>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search terminated students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-full"
          />
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="max-w-10xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between mb-6">
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <FileDownloadZone
            title="Download Excel"
            fileName="Terminated_Students.xlsx"
            fileType="excel"
            onDownload={downloadExcel}
          />
          <FileDownloadZone
            title="Download PDF"
            fileName="Terminated_Students.pdf"
            fileType="pdf"
            onDownload={downloadPDF}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto h-[80vh] overflow-y-auto relative">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-center sticky top-0 z-10">
              <tr className="whitespace-nowrap">
                <th className="px-8 py-4">S.No</th>
                <th className="px-8 py-4 text-left">Student</th>
                <th className="px-8 py-4">Student ID</th>
                <th className="px-8 py-4">Email</th>
                <th className="px-8 py-4">Mobile</th>
                <th className="px-8 py-4">Parent Name</th>
                <th className="px-8 py-4">Country</th>
                <th className="px-8 py-4">Address</th>
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
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y text-center">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-gray-500">
                    Loading terminated students...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-gray-500">
                    No terminated students found
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const globalIndex = startIndex + idx;
                  const isSelected = selectedStudents.includes(s.studentId);

                  return (
                    <tr key={s.studentId || idx} className={`hover:bg-gray-50 ${isSelected ? "bg-red-50" : ""}`}>
                      <td className="px-4 py-4 whitespace-nowrap text-center">{startIndex + idx + 1}</td>
                      <td className="px-4 py-4 text-left whitespace-nowrap text-center">
                        <div
                          onClick={() => navigate(`/student/profile/${s.studentId || s._id}`, { state: { studentData: s } })}
                          className="flex items-center justify-start gap-3 cursor-pointer"
                        >
                          <Avatar name={s.name} image={s.profileImage} />
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium whitespace-nowrap text-center">{s.studentId}</td>
                      <td className="px-4 py-4 text-gray-600 whitespace-nowrap text-center">{s.email}</td>
                      <td className="px-4 py-4 text-gray-600 whitespace-nowrap text-center">{s.mobile}</td>
                      <td className="px-4 py-4 text-gray-600 hidden sm:table-cell whitespace-nowrap text-center">{s.parentName || "-"}</td>
                      <td className="px-4 py-4 text-gray-600 hidden sm:table-cell whitespace-nowrap text-center">{s.country}</td>
                      <td className="px-4 py-4 text-gray-600 break-words hidden sm:table-cell min-w-[250px] text-center">{s.address}</td>
                      <td className="px-4 py-4 relative whitespace-nowrap text-center">
                        <button
                          onClick={() => setOpenStatusIndex(openStatusIndex === globalIndex ? null : globalIndex)}
                          className="flex items-center gap-1 mx-auto"
                        >
                          <Badge text={s.status} type={s.status} />
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        {openStatusIndex === globalIndex && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-20">
                            {STATUS_OPTIONS.map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(globalIndex, status)}
                                className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(s.studentId)}
                          className="w-4 h-4 accent-red-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}