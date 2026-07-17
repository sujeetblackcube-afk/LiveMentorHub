import React, { useState, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown, X } from "lucide-react";
import Badge from "../components/Badge";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getParents, updateParentStatus, BACKEND_BASE_URL } from "../services/api";

const Avatar = ({ name, image }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2)
    : "?";

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `${BACKEND_BASE_URL}${img}`;
  };

  const imageUrl = getImageUrl(image);

  return imageUrl ? (
    <img src={imageUrl} alt={name} className="w-9 h-9 rounded-full object-cover" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
      {initials}
    </div>
  );
};
// Small avatar for student images in the table
const SmallAvatar = ({ name, image }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2)
    : "?";

  // Handle image URL - prepend BACKEND_BASE_URL if it's a relative path
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `${BACKEND_BASE_URL}${img}`;
  };

  const imageUrl = getImageUrl(image);

  return imageUrl ? (
    <img src={imageUrl} alt={name || 'Student'} className="w-8 h-8 rounded-full object-cover border-2 border-white -ml-2 first:ml-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white -ml-2 first:ml-0">
      {initials}
    </div>
  );
};


const statusTypeMap = {
  APPROVED: "success",
  SUSPENDED: "warning",
  TERMINATED: "danger",
};

export default function ApprovedParents() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openStatusIndex, setOpenStatusIndex] = useState(null);
  const [selectedParents, setSelectedParents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const statusOptions = ["APPROVED", "SUSPENDED", "TERMINATED"];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Modal state for student popup
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedParentStudents, setSelectedParentStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchParents = async () => {
      setLoading(true);
      try {
        const params = { status: "APPROVED", page: currentPage, limit: itemsPerPage };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (searchTerm) params.search = searchTerm;
        const response = await getParents(params);
        setParents(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch parents:", err);
        setParents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
  }, [startDate, endDate, currentPage, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const filteredParents = parents;
  const paginatedParents = parents;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const downloadExcel = async () => {
    try {
      const params = { status: "APPROVED", limit: 100000 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await getParents(params);
      const allData = response.data || [];
      const dataToExport = selectedParents.length > 0
        ? allData.filter((p) => selectedParents.includes(p.parentId))
        : allData;
      if (dataToExport.length === 0) { alert("No parents to export"); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Parents");
      XLSX.writeFile(wb, "parents.xlsx");
    } catch (err) {
      console.error("Failed to download Excel:", err);
    }
  };

  const downloadPDF = async () => {
    try {
      const params = { status: "APPROVED", limit: 100000 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await getParents(params);
      const allData = response.data || [];
      const dataToExport = selectedParents.length > 0
        ? allData.filter((p) => selectedParents.includes(p.parentId))
        : allData;
      if (dataToExport.length === 0) { alert("No parents to export"); return; }
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Parents List", 14, 15);
      const columns = ["ID", "Name", "Email", "Mobile", "Address", "Status"];
      const rows = dataToExport.map((parent) => [
        parent.parentId, parent.name, parent.email,
        parent.mobile, parent.address || "-", parent.status,
      ]);
      autoTable(doc, { head: [columns], body: rows, startY: 25, styles: { fontSize: 9 }, headStyles: { fillColor: [22, 163, 74] } });
      doc.save("parents.pdf");
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  const handleStatusChange = async (index, status) => {
    const parent = paginatedParents[index];
    try {
      await updateParentStatus(parent.parentId, status);
      if (status !== "APPROVED") {
        const updated = parents.filter(p => p.parentId !== parent.parentId);
        setParents(updated);
      } else {
        const updated = parents.map(p =>
          p.parentId === parent.parentId ? { ...p, status: status } : p
        );
        setParents(updated);
      }
      setOpenStatusIndex(null);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedParents((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id];
      if (newSelection.length === filteredParents.length && filteredParents.length > 0) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedParents([]);
      setSelectAll(false);
    } else {
      setSelectedParents(filteredParents.map((p) => p.parentId));
      setSelectAll(true);
    }
  };
   // Function to handle student images click
  const handleStudentClick = (students) => {
    setSelectedParentStudents(students || []);
    setShowStudentModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowStudentModal(false);
    setSelectedParentStudents([]);
  };

  // Helper function to get image URL
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `${BACKEND_BASE_URL}${img}`;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen overflow-hidden">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-800">
            Approved Parents
          </h1>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            placeholder="Search Parent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-full"
          />
        </div>
      </div>

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
          <button
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 w-full sm:w-auto"
            onClick={() => {
              // console.log("Download Excel", startDate, endDate);
              downloadExcel();
            }}
          >
            Download Excel
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 w-full sm:w-auto"
            onClick={() => {
              // console.log("Download PDF", startDate, endDate);
              downloadPDF();
            }}
          >
            Download PDF
          </button>
        </div>
      </div>


      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto h-[80vh] overflow-y-auto relative">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-center sticky top-0 z-10">
              <tr className="whitespace-nowrap">
                <th className="px-8 py-4">S.no</th>
                <th className="px-8 py-4">Parent</th>
                <th className="px-8 py-4">Parent ID</th>
                <th className="px-8 py-4">Students</th>
                <th className="px-8 py-4">Email</th>
                <th className="px-8 py-4">Mobile</th>
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
                  <td colSpan="9" className="px-8 py-5 text-center text-gray-500">
                    Loading Parents...
                  </td>
                </tr>
              ) : paginatedParents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-8 py-5 text-center text-gray-500">
                    No approved parents found.
                  </td>
                </tr>
              ) : (
                paginatedParents.map((p, i) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + i;
                  return (
                    <tr
                      key={p.parentId}
                      className="border-t hover:bg-gray-50 whitespace-nowrap"
                    >
                      <td className="px-8 py-5">
                        {globalIndex + 1}
                      </td>

                      <td className="px-8 py-5">
                        <div
                          onClick={() =>
                            navigate(`/parents/profile/${p.parentId}`)
                          }
                          className="flex items-center gap-4 cursor-pointer"
                        >
                          <Avatar name={p.name} image={p.profileImage} />
                          <span className="font-medium text-gray-800 hover:text-indigo-600">
                            {p.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-5 font-medium">{p.parentId}</td>
                      {/* Students Column - Show all student images */}
                  <td className="px-4 py-5">
                    {p.students && p.students.length > 0 ? (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                        onClick={() => handleStudentClick(p.students)}
                        title="Click to view all students"
                      >
                        <div className="flex -space-x-2">
                          {p.students.slice(0, 3).map((student, idx) => (
                            <SmallAvatar 
                              key={idx} 
                              name={student.name} 
                              image={student.profileImage} 
                            />
                          ))}
                        </div>
                        {p.students.length > 3 && (
                          <span className="ml-2 text-xs text-gray-500 font-medium">
                            +{p.students.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No students</span>
                    )}
                  </td>
                      <td className="px-8 py-5 text-gray-500">{p.email}</td>
                      <td className="px-8 py-5 text-gray-500">{p.mobile}</td>
                      <td className="px-8 py-5 text-gray-500">{p.address || "-"}</td>

                      <td className="relative px-8 py-5">
                        <button
                          onClick={() =>
                            setOpenStatusIndex(openStatusIndex === i ? null : i)
                          }
                          className="flex items-center gap-1"
                        >
                          <Badge
                            text={p.status}
                            type={statusTypeMap[p.status] || "default"}
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
                          checked={selectedParents.includes(p.parentId)}
                          onChange={() => toggleSelectOne(p.parentId)}
                          className="w-4 h-4"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {"<"}
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
              {">"}
            </button>
          </div>
        </div>
      </div>
      {/* Student Popup Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Students</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {selectedParentStudents.length > 0 ? (
                <div className="space-y-4">
                  {selectedParentStudents.map((student, idx) => {
                    const modalImageUrl = getImageUrl(student.profileImage);
                    
                    return (
                      <div 
                        key={idx}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        {modalImageUrl ? (
                          <img 
                            src={modalImageUrl} 
                            alt={student.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                            {student.name ? student.name.slice(0, 2).toUpperCase() : 'NA'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No students found</p>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
