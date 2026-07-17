import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { theme } from '../theme';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getAllTestsByCourseCode,
  getAllQuestions,
  getTeacherCourses
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Trash2, Edit, Check, X, FileText, Clock, BookOpen, List, ClipboardList } from 'lucide-react';
import Pagination from '../components/Pagination';

const Test = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showQuestionDropdown, setShowQuestionDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedCourseForFilter, setSelectedCourseForFilter] = useState('');
  const [courseFilteredTests, setCourseFilteredTests] = useState([]);
  const [loadingCourseTests, setLoadingCourseTests] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageCourse, setCurrentPageCourse] = useState(1);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('below'); // 'above' or 'below'
  const itemsPerPage = 10;
  
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  const teacherId = user?.teacherId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseCode: '',
    durationMinutes: 30,
    startTime: '',
    endTime: '',
    maxAttempts: 1,
    isPublished: true
  });

  useEffect(() => {
    if (teacherId) {
      fetchQuestions();
      fetchTests();
      fetchTeacherCourses();
    }
  }, [teacherId]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (showQuestionDropdown && dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 400; // Approximate dropdown height
      
      // If there's not enough space below, open above
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setDropdownPosition('above');
      } else {
        setDropdownPosition('below');
      }
    }
  }, [showQuestionDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowQuestionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      // console.log('Fetching questions for teacherId:', teacherId);
      const response = await getAllQuestions({ teacherId });
      // console.log('Questions response:', response);
      
      if (response.success) {
        let questionsData = [];
        if (response.questions && Array.isArray(response.questions)) {
          questionsData = response.questions;
        } else if (response.data && Array.isArray(response.data)) {
          questionsData = response.data;
        } else if (Array.isArray(response)) {
          questionsData = response;
        }
        
        setQuestions(questionsData);
        // console.log('Questions loaded:', questionsData.length);
        
        if (questionsData.length === 0) {
          toast.info('No questions found. Please create some questions first.');
        }
      } else {
        console.error('Failed to fetch questions:', response.message);
        toast.error(response.message || 'Error fetching questions');
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Error fetching questions. Please check your connection.');
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      const response = await getTeacherCourses();
      if (response.status) {
        setTeacherCourses(response.data || []);
      }
    } catch (error) {
      toast.error('Error fetching courses');
    }
  };
  
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await getAllTests({ teacherId });
      if (response.success) {
        setTests(response.tests || []);
      }
    } catch (error) {
      toast.error('Error fetching tests');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsByCourse = async (courseCode) => {
    if (!courseCode) {
      setCourseFilteredTests([]);
      return;
    }
    try {
      setLoadingCourseTests(true);
      const response = await getAllTestsByCourseCode(courseCode);
      if (response.success) {
        setCourseFilteredTests(response.tests || []);
      } else {
        toast.error(response.message || 'Failed to fetch tests');
        setCourseFilteredTests([]);
      }
    } catch (error) {
      toast.error('Error fetching tests by course');
      setCourseFilteredTests([]);
    } finally {
      setLoadingCourseTests(false);
    }
  };

  const handleCourseFilterChange = (e) => {
    const courseCode = e.target.value;
    setSelectedCourseForFilter(courseCode);
    fetchTestsByCourse(courseCode);
  };

  const getFilteredQuestions = () => {
    if (!searchTerm) return questions;
    const term = searchTerm.toLowerCase();
    return questions.filter(q => 
      q.questionText?.toLowerCase().includes(term) ||
      q.questionType?.toLowerCase().includes(term) ||
      q.difficultyLevel?.toLowerCase().includes(term)
    );
  };

  const filteredQuestions = getFilteredQuestions();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const toggleQuestionSelection = (question) => {
    const isSelected = selectedQuestions.some(q => q.id === question.id);
    if (isSelected) {
      setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
    } else {
      setSelectedQuestions(prev => [...prev, question]);
    }
  };

  const handleDoneSelection = () => {
    setShowQuestionDropdown(false);
    setSearchTerm('');
  };

  const removeQuestion = (questionId) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseCode: '',
      durationMinutes: 30,
      startTime: '',
      endTime: '',
      maxAttempts: 1,
      isPublished: false
    });
    setSelectedQuestions([]);
    setSearchTerm('');
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Test title is required');
      return;
    }
    if (!formData.courseCode) {
      toast.error('Course code is required');
      return;
    }
    if (!formData.durationMinutes) {
      toast.error('Duration is required');
      return;
    }
    if (!formData.startTime) {
      toast.error('Start time is required');
      return;
    }
    if (!formData.endTime) {
      toast.error('End time is required');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }
    try {
      setSubmitting(true);
      const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const questionIds = selectedQuestions.map(q => q.id);
      const testData = {
        ...formData,
        teacherId,
        questions: questionIds,
        totalMarks
      };
      const response = await createTest(testData);
      if (response.success) {
        toast.success('Test created successfully');
        resetForm();
        setActiveTab('list');
        fetchTests();
      } else {
        toast.error(response.message || 'Failed to create test');
      }
    } catch (error) {
      toast.error('Error creating test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = async (testId) => {
    try {
      const response = await getTestById(testId);
      if (response.success && response.test) {
        const test = response.test;
        setSelectedTest(test);
        setFormData({
          title: test.title || '',
          description: test.description || '',
          courseCode: test.courseCode || '',
          durationMinutes: test.durationMinutes || 30,
          startTime: test.startTime ? test.startTime.slice(0, 16) : '',
          endTime: test.endTime ? test.endTime.slice(0, 16) : '',
          maxAttempts: test.maxAttempts || 1,
          isPublished: test.isPublished || true
        });
        if (test.questions && test.questions.length > 0) {
          const selected = questions.filter(q => test.questions.includes(q.id));
          setSelectedQuestions(selected);
        }
        setActiveTab('edit');
      }
    } catch (error) {
      toast.error('Error fetching test details');
    }
  };

  const handleUpdateTest = async (e) => {
    e.preventDefault();
    if (!selectedTest) return;
    if (!formData.title || !formData.courseCode || !formData.durationMinutes || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all required fields');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }
    try {
      setSubmitting(true);
      const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const questionIds = selectedQuestions.map(q => q.id);
      const testData = {
        ...formData,
        questions: questionIds,
        totalMarks
      };
      const response = await updateTest(selectedTest.id, testData);
      if (response.success) {
        toast.success('Test updated successfully');
        resetForm();
        setSelectedTest(null);
        setActiveTab('list');
        fetchTests();
      } else {
        toast.error(response.message || 'Failed to update test');
      }
    } catch (error) {
      toast.error('Error updating test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTest = async (id) => {
    try {
      const response = await deleteTest(id);
      if (response.success) {
        toast.success('Test deleted successfully');
        setShowDeleteConfirm(null);
        fetchTests();
      } else {
        toast.error(response.message || 'Failed to delete test');
      }
    } catch (error) {
      toast.error('Error deleting test');
    }
  };

  // Pagination logic for List tab
  const filteredTests = tests.filter(t => !searchTerm || t.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTests = filteredTests.slice(startIndex, startIndex + itemsPerPage);

  // Pagination logic for Course tab
  const totalPagesCourse = Math.ceil(courseFilteredTests.length / itemsPerPage);
  const startIndexCourse = (currentPageCourse - 1) * itemsPerPage;
  const paginatedCourseTests = courseFilteredTests.slice(startIndexCourse, startIndexCourse + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageChangeCourse = (page) => {
    setCurrentPageCourse(page);
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset course page when course filter changes
  useEffect(() => {
    setCurrentPageCourse(1);
  }, [selectedCourseForFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.secondary }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
          <div className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Loading tests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: theme.colors.secondary }}>
      {/* Header Section */}
      <div style={{ background: theme.colors.primary }}>
        <div className="px-4 py-8 sm:px-6 md:px-8 lg:px-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Test Management</h1>
              <p className="text-white/80 text-base sm:text-lg">Create, manage, and track tests for your courses</p>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="bg-white/20 rounded-xl p-3 sm:p-4 min-w-[100px] sm:min-w-[140px]">
                <div className="text-2xl sm:text-3xl font-bold text-white">{tests.length}</div>
                <div className="text-white/80 text-xs sm:text-sm">Total Tests</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 sm:p-4 min-w-[100px] sm:min-w-[140px]">
                <div className="text-2xl sm:text-3xl font-bold text-white">{tests.filter(t => t.isPublished).length}</div>
                <div className="text-white/80 text-xs sm:text-sm">Published</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 sm:p-4 min-w-[100px] sm:min-w-[140px]">
                <div className="text-2xl sm:text-3xl font-bold text-white">{teacherCourses.length}</div>
                <div className="text-white/80 text-xs sm:text-sm">Courses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 md:px-8 lg:px-20 -mt-6">
        {/* Tab Navigation - Responsive */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0 gap-2">
            {[
              { id: 'list', icon: List, label: 'All Tests' },
              { id: 'create', icon: Plus, label: 'Create Test' },
              { id: 'course', icon: BookOpen, label: 'By Course' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id); 
                  if (tab.id === 'create') resetForm();
                  if (tab.id === 'list') setSearchTerm('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                  activeTab === tab.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{ background: activeTab === tab.id ? theme.colors.primary : 'transparent' }}
              >
                <tab.icon size={16} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
                  <input 
                    type="text" 
                    placeholder="Search tests by title..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2"
                    style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                  />
                </div>
              </div>
            </div>

            {tests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                  <ClipboardList size={32} className="sm:w-10 sm:h-10" style={{ color: theme.colors.primary }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>No Tests Found</h3>
                <p className="text-sm sm:text-base" style={{ color: theme.colors.textSecondary }}>Create your first test to get started</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                  <Search size={32} className="sm:w-10 sm:h-10" style={{ color: theme.colors.primary }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>No Results Found</h3>
                <p className="text-sm sm:text-base" style={{ color: theme.colors.textSecondary }}>No tests match your search criteria</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr style={{ background: theme.colors.primary }}>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">S.No</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Title</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Course</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Questions</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Marks</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Duration</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Status</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTests.map((test, index) => (
                          <tr key={test.id} className="border-b hover:bg-gray-50" style={{ borderColor: theme.colors.border }}>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base" style={{ color: theme.colors.textPrimary }}>{startIndex + index + 1}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base" style={{ color: theme.colors.textPrimary }}>
                              <div className="font-medium">{test.title}</div>
                              {test.description && <div className="text-xs mt-1 hidden sm:block" style={{ color: theme.colors.textSecondary }}>{test.description.substring(0, 50)}...</div>}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base" style={{ color: theme.colors.textPrimary }}>{test.courseCode}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base" style={{ color: theme.colors.textPrimary }}>{test.questions?.length || 0}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base" style={{ color: theme.colors.primary }}>{test.totalMarks}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base" style={{ color: theme.colors.textPrimary }}><span className="flex items-center gap-1"><Clock size={14} className="hidden sm:inline" />{test.durationMinutes} min</span></td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ backgroundColor: test.isPublished ? '#D1FAE5' : '#FEF3C7', color: test.isPublished ? '#065F46' : '#92400E' }}>
                                {test.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditClick(test.id)} className="p-1.5 sm:p-2 rounded-lg text-white hover:scale-110 transition-transform" style={{ background: theme.colors.primary }} title="Edit"><Edit size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                                <button onClick={() => setShowDeleteConfirm(test.id)} className="p-1.5 sm:p-2 rounded-lg text-white hover:scale-110 transition-transform" style={{ background: '#EF4444' }} title="Delete"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Course Tab */}
        {activeTab === 'course' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
              <div className="max-w-md mx-auto w-full">
                <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Select Course</label>
                <select
                  value={selectedCourseForFilter}
                  onChange={handleCourseFilterChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl text-sm sm:text-base"
                  style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                >
                  <option value="">Choose a course...</option>
                  {teacherCourses.map(course => (
                    <option key={course.id} value={course.courseCode}>{course.courseName} ({course.courseCode})</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingCourseTests ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
              </div>
            ) : selectedCourseForFilter && courseFilteredTests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
                <FileText size={40} className="sm:w-12 sm:h-12 mx-auto mb-4" style={{ color: theme.colors.primary }} />
                <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>No Tests Found</h3>
                <p className="text-sm sm:text-base" style={{ color: theme.colors.textSecondary }}>No tests found for this course</p>
              </div>
            ) : selectedCourseForFilter ? (
              <>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr style={{ background: theme.colors.primary }}>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">S.No</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Title</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Questions</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Marks</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Duration</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Status</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCourseTests.map((test, index) => (
                          <tr key={test.id} className="border-b hover:bg-gray-50" style={{ borderColor: theme.colors.border }}>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base" style={{ color: theme.colors.textPrimary }}>{startIndexCourse + index + 1}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base" style={{ color: theme.colors.textPrimary }}>{test.title}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base">{test.questions?.length || 0}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base" style={{ color: theme.colors.primary }}>{test.totalMarks}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base">{test.durationMinutes} min</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ backgroundColor: test.isPublished ? '#D1FAE5' : '#FEF3C7', color: test.isPublished ? '#065F46' : '#92400E' }}>
                                {test.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditClick(test.id)} className="p-1.5 sm:p-2 rounded-lg text-white" style={{ background: theme.colors.primary }}><Edit size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                                <button onClick={() => setShowDeleteConfirm(test.id)} className="p-1.5 sm:p-2 rounded-lg text-white" style={{ background: '#EF4444' }}><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {totalPagesCourse > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPageCourse}
                      totalPages={totalPagesCourse}
                      onPageChange={handlePageChangeCourse}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
                <BookOpen size={40} className="sm:w-12 sm:h-12 mx-auto mb-4" style={{ color: theme.colors.primary }} />
                <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>Select a Course</h3>
                <p className="text-sm sm:text-base" style={{ color: theme.colors.textSecondary }}>Choose a course from the dropdown to view tests</p>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Tab */}
        {(activeTab === 'create' || activeTab === 'edit') && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6" style={{ background: theme.colors.primary }}>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <Plus size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  {activeTab === 'create' ? 'Create New Test' : 'Edit Test'}
                </h2>
              </div>
              
              <form onSubmit={activeTab === 'create' ? handleCreateTest : handleUpdateTest} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Test Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-sm sm:text-base"
                      style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                      placeholder="Enter test title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Course Code *</label>
                    <select
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none text-sm sm:text-base"
                      style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                      required
                    >
                      <option value="">Select a course</option>
                      {teacherCourses.map(course => (
                        <option key={course.id} value={course.courseCode}>
                          {course.courseName} ({course.courseCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none text-sm sm:text-base"
                    style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                    placeholder="Enter test description"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Duration (minutes) *</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none text-sm sm:text-base"
                      style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Max Attempts</label>
                    <input
                      type="number"
                      name="maxAttempts"
                      value={formData.maxAttempts}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none text-sm sm:text-base"
                      style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Start Time *</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none text-sm sm:text-base"
                      style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>End Time *</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none text-sm sm:text-base"
                      style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                      required
                    />
                  </div>
                </div>

                {/* Question Selection - Dropdown opens ABOVE */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                    Select Questions * <span className="text-sm font-normal">(Select at least one question)</span>
                  </label>
                  
                  <div className="relative" ref={dropdownRef}>
                    <div
                      ref={dropdownButtonRef}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl cursor-pointer min-h-[50px] flex flex-wrap gap-2"
                      style={{ borderColor: theme.colors.border }}
                      onClick={() => {
                        if (questions.length === 0) {
                          toast.warning('No questions available. Please create questions first.');
                          return;
                        }
                        setShowQuestionDropdown(!showQuestionDropdown);
                      }}
                    >
                      {selectedQuestions.length === 0 ? (
                        <span className="text-gray-400 text-sm sm:text-base">Click to select questions</span>
                      ) : (
                        selectedQuestions.map(q => (
                          <span
                            key={q.id}
                            className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                            style={{ backgroundColor: theme.colors.primary, color: 'white' }}
                          >
                            {q.questionText?.substring(0, 25)}...
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                              className="ml-1 sm:ml-2 hover:text-red-200"
                            >
                              <X size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {showQuestionDropdown && (
                      <div 
                        className={`absolute z-20 w-full mt-1 border-2 rounded-xl shadow-lg bg-white ${
                          dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}
                        style={{ borderColor: theme.colors.border }}
                      >
                        <div className="p-2 border-b" style={{ borderColor: theme.colors.border }}>
                          <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
                            <input
                              type="text"
                              placeholder="Search questions..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border-2 rounded-lg text-sm"
                              style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto">
                          {loadingQuestions ? (
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: theme.colors.primary }}></div>
                              <p className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>Loading questions...</p>
                            </div>
                          ) : filteredQuestions.length === 0 ? (
                            <div className="p-4 text-center">
                              {questions.length === 0 ? (
                                <>
                                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No questions found</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowQuestionDropdown(false);
                                      // Navigate to question creation
                                      window.location.href = '/questions';
                                    }}
                                    className="mt-2 text-sm text-blue-600 hover:underline"
                                  >
                                    Create a question first →
                                  </button>
                                </>
                              ) : (
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No questions match your search</p>
                              )}
                            </div>
                          ) : (
                            filteredQuestions.map(question => {
                              const isSelected = selectedQuestions.some(q => q.id === question.id);
                              return (
                                <div
                                  key={question.id}
                                  className="p-2 sm:p-3 cursor-pointer border-b hover:bg-gray-50"
                                  style={{ borderColor: theme.colors.border, backgroundColor: isSelected ? theme.colors.secondary : 'transparent' }}
                                  onClick={() => toggleQuestionSelection(question)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs sm:text-sm font-medium break-words" style={{ color: theme.colors.textPrimary }}>
                                        {question.questionText || 'Untitled Question'}
                                      </p>
                                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                                        <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                                          {question.questionType || 'Unknown'}
                                        </span>
                                        <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap" style={{ 
                                          backgroundColor: question.difficultyLevel === 'easy' ? '#D1FAE5' : question.difficultyLevel === 'medium' ? '#FEF3C7' : '#FEE2E2', 
                                          color: question.difficultyLevel === 'easy' ? '#065F46' : question.difficultyLevel === 'medium' ? '#92400E' : '#991B1B' 
                                        }}>
                                          {question.difficultyLevel || 'medium'}
                                        </span>
                                        <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                          Marks: {question.marks || 0}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
                                      {isSelected ? (
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
                                          <Check size={12} className="sm:w-4 sm:h-4 text-white" />
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2" style={{ borderColor: theme.colors.border }}></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="p-2 border-t" style={{ borderColor: theme.colors.border }}>
                          <button
                            type="button"
                            onClick={handleDoneSelection}
                            className="w-full px-3 sm:px-4 py-2 rounded-lg text-white font-medium text-sm sm:text-base"
                            style={{ backgroundColor: theme.colors.primary }}
                          >
                            Done ({selectedQuestions.length} selected)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedQuestions.length > 0 && (
                    <div className="mt-2 text-xs sm:text-sm" style={{ color: theme.colors.textSecondary }}>
                      Selected {selectedQuestions.length} questions • Total Marks: {selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-white font-semibold disabled:opacity-50 hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                    style={{ background: theme.colors.primary }}
                  >
                    {submitting ? 'Saving...' : activeTab === 'create' ? 'Create Test' : 'Update Test'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('list'); resetForm(); setSelectedTest(null); }}
                    className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold border-2 text-sm sm:text-base"
                    style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6" style={{ background: '#EF4444' }}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Trash2 size={20} className="sm:w-5 sm:h-5" />
                  Confirm Delete
                </h2>
                <button onClick={() => setShowDeleteConfirm(null)} className="text-white hover:text-white/80 text-xl sm:text-2xl">×</button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: theme.colors.textPrimary }}>Are you sure you want to delete this test? This action cannot be undone.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={() => handleDeleteTest(showDeleteConfirm)} className="px-4 py-2.5 sm:py-3 rounded-xl text-white font-medium text-sm sm:text-base" style={{ background: '#EF4444' }}>Delete</button>
                <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2.5 sm:py-3 rounded-xl font-medium border-2 text-sm sm:text-base" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Test;