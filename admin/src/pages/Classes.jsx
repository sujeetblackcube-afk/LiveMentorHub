import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 1. DUMMY DATA: Added 'classId' to be used in the URL routing.
const DUMMY_DATA = [
  { id: 1, classId: 'cls-9', classLevel: 'Class 9', totalSubjects: 5, totalCourses: 8, enrolledStudents: 39 },
  { id: 2, classId: 'cls-10', classLevel: 'Class 10', totalSubjects: 6, totalCourses: 12, enrolledStudents: 145 },
  { id: 3, classId: 'cls-11', classLevel: 'Class 11', totalSubjects: 4, totalCourses: 5, enrolledStudents: 89 },
  { id: 4, classId: 'cls-12', classLevel: 'Class 12', totalSubjects: 5, totalCourses: 10, enrolledStudents: 210 },
];

// ---------------------------------------------------------------------------
// AddClassModal Component
// ---------------------------------------------------------------------------
function AddClassModal({ isOpen, onClose, onAdd }) {
  const [className, setClassName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!className.trim()) return;

    // Pass the new class data back to the parent. Counts default to 0.
    onAdd({
      classLevel: className,
      totalSubjects: 0,
      totalCourses: 0,
      enrolledStudents: 0,
    });

    // Reset and close
    setClassName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Add New Class</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6">
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
              Class Name
            </label>
            <input
              type="text"
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g., Class 8"
              className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoFocus
            />
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!className.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Add Class
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT: CourseStatisticsTable
// ---------------------------------------------------------------------------
export default function CourseStatisticsTable() {
  const [tableData, setTableData] = useState(DUMMY_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate();

  // Handler for receiving data from the modal
  const handleAddClass = (newClassData) => {
    // Generate temporary IDs (you'll rely on the DB's IDs after API integration)
    const uniqueId = Date.now();
    const newClassWithId = {
      ...newClassData,
      id: uniqueId, 
      classId: `cls-${uniqueId}` // Generate a dummy classId for routing
    };
    
    // Update state to include the new row
    setTableData([...tableData, newClassWithId]);

    // Show snackbar and hide it after 3 seconds
    setShowSnackbar(true);
    setTimeout(() => {
      setShowSnackbar(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section with Flexbox for the Button */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Course Statistics</h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of courses and student enrollments across all classes.
            </p>
          </div>
          
          {/* Big Add Class Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <span className="mr-2 text-lg leading-none">+</span> Add Class
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg border">
          <div className="overflow-x-auto h-[60vh] overflow-y-auto relative">
            <div className="p-3 sm:p-4 rounded-lg mb-4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search classes..."
                  className="w-full max-w-xs pl-3 pr-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <table className="w-full text-sm table-fixed">
              
              {/* Table Header */}
              <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                <tr className="whitespace-nowrap">
                  <th scope="col" className="px-6 py-4 text-left font-medium">Class</th>
                  <th scope="col" className="px-6 py-4 text-left font-medium">Total Subjects</th>
                  <th scope="col" className="px-6 py-4 text-left font-medium">Total Courses</th>
                  <th scope="col" className="px-6 py-4 text-left font-medium">Enrolled Students</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                ) : tableData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No course statistics available.
                    </td>
                  </tr>
                ) : (
                  // Apply simple client-side search filtering for UI only
                  tableData
                    .filter((row) => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return (
                        String(row.classLevel).toLowerCase().includes(q) ||
                        String(row.classId).toLowerCase().includes(q)
                      );
                    })
                    .map((row) => (
                      <tr
                        key={row.id}
                        className="border-t hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out whitespace-nowrap"
                        onClick={() => navigate(`/classes/${row.classId}`)}
                      >
                        <td className="px-6 py-4 font-medium">
                          <div className="text-gray-900">{row.classLevel}</div>
                          <div className="text-xs text-gray-500">{row.classId}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{row.totalSubjects}</td>
                        <td className="px-6 py-4 text-gray-600">{row.totalCourses}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            {row.enrolledStudents} students
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
              
            </table>
          </div>
        </div>

      </div>

      {/* Render the Modal */}
      <AddClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddClass} 
      />

      {/* Success Snackbar */}
      <div 
        className={`fixed bottom-4 right-4 z-50 flex items-center bg-green-600 text-white px-4 py-3 rounded shadow-lg transform transition-all duration-300 ease-in-out ${
          showSnackbar ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-medium text-sm">Class added successfully!</span>
      </div>
    </div>
  );
}
