import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { getAssignmentOfStudentByTeacher, updateSubmissionMarksAndFeedback } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, User, BookOpen, CheckCircle, XCircle, Clock, Eye, FileText, Download } from 'lucide-react';
import Pagination from '../components/Pagination';

const SubmittedAssignments = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showMarksFeedbackPopup, setShowMarksFeedbackPopup] = useState(false);
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState(null);
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  const teacherId = user?.teacherId;

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId, statusFilter]);

const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAssignmentOfStudentByTeacher(teacherId, statusFilter || null);
      if (response.success) {
        setData(response);
      } else {
        toast.error(response.message || 'Failed to fetch assignments');
      }
    } catch (error) {
      toast.error('Error fetching assignments');
    } finally {
      setLoading(false);
    }
  };

  // Handler to open marks and feedback popup
  const handleOpenMarksFeedbackPopup = (assignment) => {
    setSelectedAssignmentForGrading(assignment);
    setObtainedMarks(assignment.obtainedMarks || '');
    setFeedback(assignment.feedback || '');
    setShowMarksFeedbackPopup(true);
  };

  // Handler to update marks and feedback
  const handleUpdateMarksAndFeedback = async (e) => {
    e.preventDefault();
    
    if (!selectedAssignmentForGrading) return;
    
    // Validate marks
    const marks = parseFloat(obtainedMarks);
    if (isNaN(marks) || marks < 0) {
      toast.error('Please enter valid marks');
      return;
    }
    if (marks > selectedAssignmentForGrading.totalMarks) {
      toast.error(`Marks cannot exceed total marks (${selectedAssignmentForGrading.totalMarks})`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await updateSubmissionMarksAndFeedback(selectedAssignmentForGrading.id, {
        obtainedMarks: marks,
        feedback: feedback,
        teacherId: teacherId
      });
      
      if (response.success) {
        toast.success('Marks and feedback updated successfully');
        setShowMarksFeedbackPopup(false);
        setSelectedAssignmentForGrading(null);
        setObtainedMarks('');
        setFeedback('');
        // Refresh the data
        fetchData();
        // Also close the submission modal if needed
        setSelectedSubmission(null);
      } else {
        toast.error(response.message || 'Failed to update marks and feedback');
      }
    } catch (error) {
      toast.error('Error updating marks and feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Close popup and reset state
  const handleCloseMarksFeedbackPopup = () => {
    setShowMarksFeedbackPopup(false);
    setSelectedAssignmentForGrading(null);
    setObtainedMarks('');
    setFeedback('');
  };

  // Filter students based on search term
  const getFilteredStudents = () => {
    if (!data?.students) return [];
    
    if (!searchTerm) return data.students;
    
    const term = searchTerm.toLowerCase();
    return data.students.filter(student => 
      student.studentName.toLowerCase().includes(term) ||
      student.studentId.toLowerCase().includes(term)
    );
  };

  // Pagination
  const filteredStudents = getFilteredStudents();
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return { bg: '#FEF3C7', text: '#92400E', icon: Clock };
      case 'checked':
        return { bg: '#D1FAE5', text: '#065F46', icon: CheckCircle };
      case 'notsubmitted':
        return { bg: '#FEE2E2', text: '#991B1B', icon: XCircle };
      default:
        return { bg: '#E5E7EB', text: '#374151', icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 p-4" style={{ background: theme.colors.secondary }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
          <div className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Loading assignments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: theme.colors.secondary }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
            Submitted Assignments
          </h1>
          <p className="text-lg" style={{ color: theme.colors.textSecondary }}>
            View all student assignment submissions for your courses
          </p>
        </div>

        {/* STATUS COUNTS */}
        {data?.statusCounts && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div 
              className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
              style={{ background: theme.colors.card, border: `2px solid ${statusFilter === '' ? theme.colors.primary : theme.colors.border}` }}
              onClick={() => setStatusFilter('')}
            >
              <div className="text-3xl font-bold" style={{ color: theme.colors.primary }}>{data.statusCounts.total}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Total</div>
            </div>
            <div 
              className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
              style={{ background: theme.colors.card, border: `2px solid ${statusFilter === 'submitted' ? '#F59E0B' : theme.colors.border}` }}
              onClick={() => setStatusFilter('submitted')}
            >
              <div className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{data.statusCounts.submitted}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Submitted</div>
            </div>
            <div 
              className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
              style={{ background: theme.colors.card, border: `2px solid ${statusFilter === 'notsubmitted' ? '#EF4444' : theme.colors.border}` }}
              onClick={() => setStatusFilter('notsubmitted')}
            >
              <div className="text-3xl font-bold" style={{ color: '#EF4444' }}>{data.statusCounts.notsubmitted}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Not Submitted</div>
            </div>
            <div 
              className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
              style={{ background: theme.colors.card, border: `2px solid ${statusFilter === 'checked' ? '#10B981' : theme.colors.border}` }}
              onClick={() => setStatusFilter('checked')}
            >
              <div className="text-3xl font-bold" style={{ color: '#10B981' }}>{data.statusCounts.checked}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Checked</div>
            </div>
          </div>
        )}

        {/* SEARCH FILTER */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search by Student Name or ID"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            />
          </div>
        </div>

        {/* EMPTY STATE */}
        {!data?.students || data.students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FileText size={80} style={{ color: theme.colors.primary }} />
            <h2 className="text-2xl font-bold mt-4 mb-2" style={{ color: theme.colors.textPrimary }}>
              No Assignments Found
            </h2>
            <p style={{ color: theme.colors.textSecondary }}>
              {statusFilter ? `No ${statusFilter} assignments found` : 'No assignments have been submitted yet'}
            </p>
          </div>
        ) : (
          <>
            {/* STUDENTS TABLE */}
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <table
                  className="min-w-full border-collapse border-2 rounded-2xl overflow-hidden"
                  style={{
                    background: theme.colors.card,
                    borderColor: theme.colors.primary,
                    boxShadow: `0 8px 32px ${theme.colors.shadow}`
                  }}
                >
                  <thead className="sticky top-0 z-10">
                    <tr style={{ background: theme.colors.primary }}>
                      <th className="px-6 py-4 text-left font-bold text-white border-r">
                        S.No
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-white border-r">
                        <div className="flex items-center">
                          <User size={20} className="mr-2" />
                          Student Name
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-white border-r">
                        <div className="flex items-center">
                          <BookOpen size={20} className="mr-2" />
                          Total Assignments
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-white">
                        <div className="flex items-center">
                          <Eye size={20} className="mr-2" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student, index) => (
                      <tr
                        key={student.studentId}
                        className="hover:scale-[1.01] transition-all duration-300"
                        style={{
                          backgroundColor: index % 2 === 0 ? theme.colors.card : theme.colors.cardHover,
                          borderBottom: `1px solid ${theme.colors.border}`
                        }}
                      >
                        <td className="px-6 py-4 font-semibold border-r text-center" style={{ color: theme.colors.textPrimary }}>
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 border-r" style={{ color: theme.colors.textPrimary }}>
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ background: theme.colors.primary }}>
                              <User size={20} color="white" />
                            </div>
                            <div>
                              <div className="font-semibold">{student.studentName}</div>
                              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>{student.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r text-center" style={{ color: theme.colors.textPrimary }}>
                          <div className="flex justify-center gap-2 flex-wrap">
                            {student.assignments.map((assignment, idx) => {
                              const statusStyle = getStatusColor(assignment.status);
                              const StatusIcon = statusStyle.icon;
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                                >
                                  <StatusIcon size={12} className="mr-1" />
                                  {assignment.title?.substring(0, 15)}...
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedSubmission(student)}
                            className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 flex items-center"
                            style={{ background: theme.colors.primary }}
                          >
                            <Eye size={18} className="mr-2" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* VIEW MODAL */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6" style={{ background: theme.colors.primary }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedSubmission.studentName}</h2>
                    <p className="text-white/80">{selectedSubmission.studentId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-white hover:text-white/80 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {selectedSubmission.assignments.map((assignment, idx) => {
                    const statusStyle = getStatusColor(assignment.status);
                    const StatusIcon = statusStyle.icon;
                    return (
                      <div
                        key={idx}
                        className="border-2 rounded-xl p-4"
                        style={{ borderColor: theme.colors.border }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                              {assignment.title}
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                              {assignment.courseCode}
                            </p>
                          </div>
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                          >
                            <StatusIcon size={16} className="mr-1" />
                            {assignment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Total Marks</p>
                            <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{assignment.totalMarks}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Obtained Marks</p>
                            <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                              {assignment.obtainedMarks || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Due Date</p>
                            <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                              {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Submitted At</p>
                            <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                              {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : '-'}
                            </p>
                          </div>
                        </div>

                        {assignment.submissionText && (
                          <div className="mb-3">
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Submission Text</p>
                            <p className="p-2 rounded" style={{ backgroundColor: theme.colors.secondary, color: theme.colors.textPrimary }}>
                              {assignment.submissionText}
                            </p>
                          </div>
                        )}

                        {assignment.submissionFileUrl && (
                          <div className="mb-3">
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Attachment</p>
                            <a
                              href={assignment.submissionFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 rounded text-white text-sm"
                              style={{ background: theme.colors.success }}
                            >
                              <Download size={16} className="mr-2" />
                              View Attachment
                            </a>
                          </div>
                        )}

{assignment.feedback && (
                          <div>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Feedback</p>
                            <p className="p-2 rounded" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                              {assignment.feedback}
                            </p>
                          </div>
                        )}

                        {/* Add Marks & Feedback Button */}
                        <div className="mt-4">
                          <button
                            onClick={() => handleOpenMarksFeedbackPopup(assignment)}
                            className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 flex items-center"
                            style={{ background: theme.colors.primary }}
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Add Marks & Feedback
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
)}

        {/* MARKS AND FEEDBACK POPUP */}
        {showMarksFeedbackPopup && selectedAssignmentForGrading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-6" style={{ background: theme.colors.primary }}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Add Marks & Feedback</h2>
                  <button
                    onClick={handleCloseMarksFeedbackPopup}
                    className="text-white hover:text-white/80 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleUpdateMarksAndFeedback} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Assignment: {selectedAssignmentForGrading.title}
                  </label>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Course: {selectedAssignmentForGrading.courseCode}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Total Marks: {selectedAssignmentForGrading.totalMarks}
                  </label>
                  <input
                    type="number"
                    value={obtainedMarks}
                    onChange={(e) => setObtainedMarks(e.target.value)}
                    placeholder="Enter obtained marks"
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: theme.colors.border,
                      color: theme.colors.textPrimary,
                    }}
                    min="0"
                    max={selectedAssignmentForGrading.totalMarks}
                    step="0.5"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter feedback for the student"
                    rows="4"
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: theme.colors.border,
                      color: theme.colors.textPrimary,
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: theme.colors.primary }}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseMarksFeedbackPopup}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-all border-2"
                    style={{
                      borderColor: theme.colors.border,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmittedAssignments;
