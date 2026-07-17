import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { getTeacherTestSubmissions, updateTestSubmissionMarks } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, User, BookOpen, CheckCircle, XCircle, Clock, Eye, FileText, Check, X } from 'lucide-react';
import Pagination from '../components/Pagination';

const SubmittedTests = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showMarksPopup, setShowMarksPopup] = useState(false);
  const [selectedTestForGrading, setSelectedTestForGrading] = useState(null);
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const itemsPerPage = 10;

  const teacherId = user?.teacherId;

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getTeacherTestSubmissions(teacherId);
      if (response.status) {
        setData(response);
      } else {
        toast.error(response.message || 'Failed to fetch test submissions');
      }
    } catch (error) {
      toast.error('Error fetching test submissions');
    } finally {
      setLoading(false);
    }
  };

  // Get all submissions flattened with course code
  const getAllSubmissions = () => {
    if (!data?.data) return [];
    
    let allSubmissions = [];
    data.data.forEach(course => {
      course.submissions.forEach(sub => {
        allSubmissions.push({
          ...sub,
          courseCode: course.courseCode
        });
      });
    });
    
    return allSubmissions;
  };

  // Filter submissions based on search term and status
  const getFilteredSubmissions = () => {
    let allSubmissions = getAllSubmissions();
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      allSubmissions = allSubmissions.filter(sub => sub.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allSubmissions = allSubmissions.filter(sub => 
        sub.studentId.toLowerCase().includes(term) ||
        sub.test?.title?.toLowerCase().includes(term) ||
        sub.courseCode.toLowerCase().includes(term)
      );
    }
    
    // Sort by submittedAt date (latest first)
    return allSubmissions.sort((a, b) => {
      const dateA = new Date(a.submittedAt || 0);
      const dateB = new Date(b.submittedAt || 0);
      return dateB - dateA;
    });
  };

  // Pagination
  const filteredSubmissions = getFilteredSubmissions();
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler to open marks popup
  const handleOpenMarksPopup = (submission) => {
    setSelectedTestForGrading(submission);
    setObtainedMarks(submission.obtainedMarks || 0);
    setShowMarksPopup(true);
  };

  // Handler to update marks
  const handleUpdateMarks = async (e) => {
    e.preventDefault();
    
    if (!selectedTestForGrading) return;
    
    const marks = parseFloat(obtainedMarks);
    if (isNaN(marks) || marks < 0) {
      toast.error('Please enter valid marks');
      return;
    }

    try {
      setSubmitting(true);
      const response = await updateTestSubmissionMarks(selectedTestForGrading.submissionId, {
        obtainedMarks: marks
      });
      
      if (response.success) {
        toast.success('Marks updated successfully');
        setShowMarksPopup(false);
        setSelectedTestForGrading(null);
        setObtainedMarks('');
        fetchData();
        setSelectedSubmission(null);
      } else {
        toast.error(response.message || 'Failed to update marks');
      }
    } catch (error) {
      toast.error('Error updating marks');
    } finally {
      setSubmitting(false);
    }
  };

  // Close popup
  const handleCloseMarksPopup = () => {
    setShowMarksPopup(false);
    setSelectedTestForGrading(null);
    setObtainedMarks('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return { bg: '#FEF3C7', text: '#92400E', icon: Clock };
      case 'GRADED':
        return { bg: '#D1FAE5', text: '#065F46', icon: CheckCircle };
      case 'NOTSUBMITTED':
        return { bg: '#FEE2E2', text: '#991B1B', icon: XCircle };
      default:
        return { bg: '#E5E7EB', text: '#374151', icon: Clock };
    }
  };

  // Get status counts
  const getStatusCounts = () => {
    const allSubmissions = getAllSubmissions();
    return {
      total: allSubmissions.length,
      submitted: allSubmissions.filter(s => s.status === 'SUBMITTED').length,
      graded: allSubmissions.filter(s => s.status === 'GRADED').length,
      notSubmitted: allSubmissions.filter(s => s.status === 'NOTSUBMITTED').length
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 p-4" style={{ background: theme.colors.secondary }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
          <div className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Loading test submissions...</div>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen" style={{ background: theme.colors.secondary }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
            Submitted Tests
          </h1>
          <p className="text-lg" style={{ color: theme.colors.textSecondary }}>
            View all student test submissions for your courses
          </p>
        </div>

        {/* STATUS COUNTS - Clickable for filtering */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div 
            className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
            style={{ 
              background: theme.colors.card, 
              border: `2px solid ${statusFilter === 'ALL' ? theme.colors.primary : theme.colors.border}`,
              boxShadow: statusFilter === 'ALL' ? `0 0 10px ${theme.colors.primary}40` : 'none'
            }}
            onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
          >
            <div className="text-3xl font-bold" style={{ color: theme.colors.primary }}>{statusCounts.total}</div>
            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Total</div>
          </div>
          <div 
            className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
            style={{ 
              background: theme.colors.card, 
              border: `2px solid #F59E0B`,
              boxShadow: statusFilter === 'SUBMITTED' ? '0 0 10px #F59E0B40' : 'none'
            }}
            onClick={() => { setStatusFilter('SUBMITTED'); setCurrentPage(1); }}
          >
            <div className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{statusCounts.submitted}</div>
            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Submitted</div>
          </div>
          <div 
            className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
            style={{ 
              background: theme.colors.card, 
              border: `2px solid #EF4444`,
              boxShadow: statusFilter === 'NOTSUBMITTED' ? '0 0 10px #EF444440' : 'none'
            }}
            onClick={() => { setStatusFilter('NOTSUBMITTED'); setCurrentPage(1); }}
          >
            <div className="text-3xl font-bold" style={{ color: '#EF4444' }}>{statusCounts.notSubmitted}</div>
            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Not Submitted</div>
          </div>
          <div 
            className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
            style={{ 
              background: theme.colors.card, 
              border: `2px solid #10B981`,
              boxShadow: statusFilter === 'GRADED' ? '0 0 10px #10B98140' : 'none'
            }}
            onClick={() => { setStatusFilter('GRADED'); setCurrentPage(1); }}
          >
            <div className="text-3xl font-bold" style={{ color: '#10B981' }}>{statusCounts.graded}</div>
            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Graded</div>
          </div>
        </div>

        {/* SEARCH FILTER */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search by Student ID, Test Title or Course Code"
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
        {!data?.data || data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FileText size={80} style={{ color: theme.colors.primary }} />
            <h2 className="text-2xl font-bold mt-4 mb-2" style={{ color: theme.colors.textPrimary }}>
              No Test Submissions Found
            </h2>
            <p style={{ color: theme.colors.textSecondary }}>
              No test submissions have been made yet
            </p>
          </div>
        ) : (
          <>
            {/* SUBMISSIONS TABLE */}
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
                          Student ID
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-white border-r">
                        <div className="flex items-center">
                          <BookOpen size={20} className="mr-2" />
                          Test Title
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-white border-r">
                        Course Code
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-white border-r">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-white border-r">
                        Marks
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
                    {paginatedSubmissions.map((submission, index) => {
                      const statusStyle = getStatusColor(submission.status);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <tr
                          key={submission.submissionId}
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
                            <div className="font-semibold">{submission.studentId}</div>
                          </td>
                          <td className="px-6 py-4 border-r" style={{ color: theme.colors.textPrimary }}>
                            <div className="font-semibold">{submission.test?.title || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 border-r text-center" style={{ color: theme.colors.textPrimary }}>
                            <span className="px-2 py-1 rounded bg-gray-100 text-sm font-medium">
                              {submission.courseCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-r">
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                            >
                              <StatusIcon size={12} className="mr-1" />
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-r text-center" style={{ color: theme.colors.textPrimary }}>
                            <div className="font-semibold">
                              {submission.obtainedMarks} / {submission.test?.totalMarks || 0}
                            </div>
                            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                              {submission.percentage?.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedSubmission(submission)}
                              className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 flex items-center"
                              style={{ background: theme.colors.primary }}
                            >
                              <Eye size={18} className="mr-2" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
                    <h2 className="text-2xl font-bold text-white">Test Submission Details</h2>
                    <p className="text-white/80">Student ID: {selectedSubmission.studentId}</p>
                    <p className="text-white/80">Course: {selectedSubmission.courseCode}</p>
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
                {/* Test Info */}
                <div className="mb-6 p-4 rounded-xl" style={{ background: theme.colors.secondary }}>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                    {selectedSubmission.test?.title}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Total Marks</p>
                      <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                        {selectedSubmission.test?.totalMarks || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Obtained Marks</p>
                      <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                        {selectedSubmission.obtainedMarks}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Percentage</p>
                      <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                        {selectedSubmission.percentage?.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Submitted At</p>
                      <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                        {selectedSubmission.submittedAt 
                          ? new Date(selectedSubmission.submittedAt).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                    Questions & Answers
                  </h4>
                  {selectedSubmission.questionDetails && selectedSubmission.questionDetails.length > 0 ? (
                    selectedSubmission.questionDetails.map((question, idx) => (
                      <div
                        key={idx}
                        className="border-2 rounded-xl p-4"
                        style={{ 
                          borderColor: question.isCorrect ? '#22C55E' : '#EF4444',
                          background: question.isCorrect ? '#D1FAE5' : '#FEE2E2'
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start">
                            <span className="mr-2 font-bold" style={{ color: theme.colors.textPrimary }}>
                              Q{idx + 1}.
                            </span>
                            <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                              {question.questionText}
                            </span>
                          </div>
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: question.isCorrect ? '#22C55E' : '#EF4444',
                              color: 'white'
                            }}
                          >
                            {question.isCorrect ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
                            {question.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>

                        {/* MCQ Options */}
                        {question.questionType === 'MCQ' && (
                          <div className="ml-4 space-y-2">
                            {['optionA', 'optionB', 'optionC', 'optionD'].map((opt) => {
                              const isCorrectAnswer = question.correctAnswer === opt;
                              const isSelectedAnswer = question.selectedAnswer === opt;
                              
                              return (
                                <div
                                  key={opt}
                                  className={`p-2 rounded-lg border-2 ${
                                    isCorrectAnswer 
                                      ? 'border-green-500 bg-green-100' 
                                      : isSelectedAnswer 
                                        ? 'border-red-500 bg-red-100'
                                        : 'border-gray-200'
                                  }`}
                                >
                                  <span className="font-medium mr-2">
                                    {opt === 'optionA' ? 'A' : opt === 'optionB' ? 'B' : opt === 'optionC' ? 'C' : 'D'}.
                                  </span>
                                  {question[opt]}
                                  {isCorrectAnswer && (
                                    <span className="ml-2 text-green-600 text-sm font-bold">(Correct Answer)</span>
                                  )}
                                  {isSelectedAnswer && !isCorrectAnswer && (
                                    <span className="ml-2 text-red-600 text-sm font-bold">(Your Answer)</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Text Answer */}
                        {question.questionType === 'TEXT' && (
                          <div className="ml-4 space-y-2">
                            <div className="p-2 rounded-lg bg-white border-2 border-gray-200">
                              <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                Student's Answer:
                              </span>
                              <p className="mt-1" style={{ color: theme.colors.textPrimary }}>
                                {question.selectedAnswer || 'No answer provided'}
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-100 border-2 border-green-500">
                              <span className="text-sm font-medium text-green-700">
                                Correct Answer:
                              </span>
                              <p className="mt-1 text-green-800">
                                {question.correctAnswer || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                          Marks: {question.marks}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8" style={{ color: theme.colors.textSecondary }}>
                      No questions found
                    </div>
                  )}
                </div>

                {/* Add Marks Button */}
                <div className="mt-6">
                  <button
                    onClick={() => handleOpenMarksPopup(selectedSubmission)}
                    className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 flex items-center"
                    style={{ background: theme.colors.primary }}
                  >
                    <CheckCircle size={20} className="mr-2" />
                    Update Marks
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MARKS POPUP */}
        {showMarksPopup && selectedTestForGrading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-6" style={{ background: theme.colors.primary }}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Update Marks</h2>
                  <button
                    onClick={handleCloseMarksPopup}
                    className="text-white hover:text-white/80 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleUpdateMarks} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Test: {selectedTestForGrading.test?.title}
                  </label>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Student ID: {selectedTestForGrading.studentId}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Total Marks: {selectedTestForGrading.test?.totalMarks || 0}
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
                    max={selectedTestForGrading.test?.totalMarks || 100}
                    step="0.5"
                    required
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
                    onClick={handleCloseMarksPopup}
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

export default SubmittedTests;
