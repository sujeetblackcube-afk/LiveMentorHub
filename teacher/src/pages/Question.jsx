
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { 
  createQuestion, 
  getAllQuestions, 
  getQuestionById, 
  updateQuestion, 
  deleteQuestion,
  createQuestionsFromExcel,
  getTeacherCourses,
  createTest
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, FileSpreadsheet, Trash2, Edit, Upload, Download, Table, List, Check, X, FileText, Clock, BookOpen, ChevronRight, Filter } from 'lucide-react';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';

const Question = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const itemsPerPage = 10;

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const [showQuestionSelection, setShowQuestionSelection] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [testFormData, setTestFormData] = useState({
    title: '',
    description: '',
    courseCode: '',
    durationMinutes: 30,
    startTime: '',
    endTime: '',
    maxAttempts: 1,
    isPublished: true
  });
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MCQ',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    answerText: '',
    difficultyLevel: 'easy',
    marks: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const teacherId = user?.teacherId;

  useEffect(() => {
    if (teacherId) {
      fetchQuestions();
      fetchTeacherCourses();
    }
  }, [teacherId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowQuestionSelection(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAllQuestions({ teacherId });
      if (response.success) {
        setQuestions(response.questions || []);
      } else {
        toast.error(response.message || 'Failed to fetch questions');
      }
    } catch (error) {
      toast.error('Error fetching questions');
    } finally {
      setLoading(false);
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

  const getFilteredQuestions = () => {
    let filtered = questions;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.questionText?.toLowerCase().includes(term) ||
        q.questionType?.toLowerCase().includes(term) ||
        q.difficultyLevel?.toLowerCase().includes(term)
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(q => q.questionType === filterType);
    }
    return filtered;
  };

  const filteredQuestions = getFilteredQuestions();
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      questionType: 'MCQ',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      answerText: '',
      difficultyLevel: 'easy',
      marks: 1
    });
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!formData.questionText) {
      toast.error('Question text is required');
      return;
    }
    if (formData.questionType === 'MCQ') {
      if (!formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD || !formData.correctAnswer) {
        toast.error('All MCQ fields are required');
        return;
      }
    }
    if (formData.questionType === 'TEXT') {
      if (!formData.answerText) {
        toast.error('Answer text is required for TEXT type');
        return;
      }
    }
    try {
      setSubmitting(true);
      const response = await createQuestion({ ...formData, teacherId });
      if (response.success) {
        toast.success('Question created successfully');
        resetForm();
        setActiveTab('list');
        fetchQuestions();
      } else {
        toast.error(response.message || 'Failed to create question');
      }
    } catch (error) {
      toast.error('Error creating question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!formData.questionText) {
      toast.error('Question text is required');
      return;
    }
    if (formData.questionType === 'MCQ') {
      if (!formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD || !formData.correctAnswer) {
        toast.error('All MCQ fields are required');
        return;
      }
    }
    if (formData.questionType === 'TEXT') {
      if (!formData.answerText) {
        toast.error('Answer text is required for TEXT type');
        return;
      }
    }
    try {
      setSubmitting(true);
      const response = await updateQuestion(selectedQuestion.id, formData);
      if (response.success) {
        toast.success('Question updated successfully');
        resetForm();
        setSelectedQuestion(null);
        setActiveTab('list');
        fetchQuestions();
      } else {
        toast.error(response.message || 'Failed to update question');
      }
    } catch (error) {
      toast.error('Error updating question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      const response = await deleteQuestion(id);
      if (response.success) {
        toast.success('Question deleted successfully');
        setShowDeleteConfirm(null);
        fetchQuestions();
      } else {
        toast.error(response.message || 'Failed to delete question');
      }
    } catch (error) {
      toast.error('Error deleting question');
    }
  };

  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setFormData({
      questionText: question.questionText || '',
      questionType: question.questionType || 'MCQ',
      optionA: question.optionA || '',
      optionB: question.optionB || '',
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      correctAnswer: question.correctAnswer || '',
      answerText: question.answerText || '',
      difficultyLevel: question.difficultyLevel || 'easy',
      marks: question.marks || 1
    });
    setActiveTab('edit');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a valid Excel or CSV file');
      }
    }
  };

  const handleExcelPreview = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    try {
      setPreviewLoading(true);
      const response = await createQuestionsFromExcel(teacherId, selectedFile);
      if (response.success && response.questions) {
        setImportedQuestions(response.questions);
        setShowExcelPreview(true);
        toast.success(`${response.questions.length} questions loaded from Excel`);
      } else {
        toast.error(response.message || 'Failed to parse Excel file');
      }
    } catch (error) {
      toast.error('Error parsing Excel file');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveQuestions = async () => {
    try {
      setUploading(true);
      toast.success(`${importedQuestions.length} questions saved successfully`);
      setShowExcelPreview(false);
      setSelectedFile(null);
      setImportedQuestions([]);
      setActiveTab('list');
      fetchQuestions();
    } catch (error) {
      toast.error('Error saving questions');
    } finally {
      setUploading(false);
    }
  };

  const handleDirectBuildTest = () => {
    setSelectedQuestions([...importedQuestions]);
    setShowQuestionSelection(true);
  };

  const toggleQuestionSelection = (question) => {
    const isSelected = selectedQuestions.some(q => q.id === question.id);
    if (isSelected) {
      setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
    } else {
      setSelectedQuestions(prev => [...prev, question]);
    }
  };

  const handleSelectAllQuestions = () => {
    if (selectedQuestions.length === importedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions([...importedQuestions]);
    }
  };

  const handleTestInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCreateTestSubmit = async (e) => {
    e.preventDefault();
    if (!testFormData.title) {
      toast.error('Test title is required');
      return;
    }
    if (!testFormData.courseCode) {
      toast.error('Course code is required');
      return;
    }
    if (!testFormData.durationMinutes) {
      toast.error('Duration is required');
      return;
    }
    if (!testFormData.startTime) {
      toast.error('Start time is required');
      return;
    }
    if (!testFormData.endTime) {
      toast.error('End time is required');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }
    try {
      setTestSubmitting(true);
      const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const questionIds = selectedQuestions.map(q => q.id);
      const testData = {
        ...testFormData,
        teacherId,
        questions: questionIds,
        totalMarks
      };
      const response = await createTest(testData);
      if (response.success) {
        toast.success('Test created successfully with Excel questions');
        setShowQuestionSelection(false);
        setShowExcelPreview(false);
        setSelectedFile(null);
        setImportedQuestions([]);
        setSelectedQuestions([]);
        setTestFormData({
          title: '',
          description: '',
          courseCode: '',
          durationMinutes: 30,
          startTime: '',
          endTime: '',
          maxAttempts: 1,
          isPublished: true
        });
        navigate('/test');
      } else {
        toast.error(response.message || 'Failed to create test');
      }
    } catch (error) {
      toast.error('Error creating test');
    } finally {
      setTestSubmitting(false);
    }
  };

  const downloadSampleFormat = () => {
    const sampleData = [
      { questionText: "What is the capital of France?", questionType: "MCQ", optionA: "London", optionB: "Paris", optionC: "Berlin", optionD: "Madrid", correctAnswer: "B", answerText: "", difficultyLevel: "easy", marks: 1 },
      { questionText: "Explain photosynthesis.", questionType: "TEXT", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "", answerText: "Process by which plants convert light energy into chemical energy.", difficultyLevel: "medium", marks: 5 }
    ];
    const headers = Object.keys(sampleData[0]).join(',');
    const rows = sampleData.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SaveIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.secondary }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
          <div className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: theme.colors.secondary }}>
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%)` }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative px-6 py-12 sm:px-12 lg:px-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Question Management</h1>
              <p className="text-white/80 text-lg">Create, manage, and import questions for your courses</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[140px]">
                <div className="text-3xl font-bold text-white">{questions.length}</div>
                <div className="text-white/80 text-sm">Total Questions</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[140px]">
                <div className="text-3xl font-bold text-white">{questions.filter(q => q.questionType === 'MCQ').length}</div>
                <div className="text-white/80 text-sm">MCQ Questions</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[140px]">
                <div className="text-3xl font-bold text-white">{questions.filter(q => q.questionType === 'TEXT').length}</div>
                <div className="text-white/80 text-sm">Text Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-12 lg:px-20 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'list', icon: List, label: 'All Questions' },
              { id: 'create', icon: Plus, label: 'Create Question' },
              { id: 'excel', icon: FileSpreadsheet, label: 'Import from Excel' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id); 
                  if (tab.id === 'list') { setSearchTerm(''); setCurrentPage(1); setFilterType('all'); }
                  if (tab.id === 'create') resetForm();
                  if (tab.id === 'excel') { setSelectedFile(null); setShowExcelPreview(false); setImportedQuestions([]); }
                }}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                style={{ background: activeTab === tab.id ? theme.colors.primary : 'transparent' }}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'list' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
                  <input type="text" placeholder="Search questions..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }} />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={20} style={{ color: theme.colors.textSecondary }} />
                  <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>
                    <option value="all">All Types</option>
                    <option value="MCQ">MCQ</option>
                    <option value="TEXT">Text</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                  <Table size={40} style={{ color: theme.colors.primary }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>No Questions Found</h3>
                <p style={{ color: theme.colors.textSecondary }}>{searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter criteria' : 'Create your first question or import from Excel'}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: theme.colors.primary }}>
                        <th className="px-6 py-4 text-left text-white font-bold">S.No</th>
                        <th className="px-6 py-4 text-left text-white font-bold">Question</th>
                        <th className="px-6 py-4 text-left text-white font-bold">Type</th>
                        <th className="px-6 py-4 text-left text-white font-bold">Difficulty</th>
                        <th className="px-6 py-4 text-left text-white font-bold">Marks</th>
                        <th className="px-6 py-4 text-left text-white font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuestions.map((question, index) => (
                        <tr key={question.id} className="border-b hover:bg-gray-50" style={{ borderColor: theme.colors.border }}>
                          <td className="px-6 py-4 font-semibold" style={{ color: theme.colors.textPrimary }}>{startIndex + index + 1}</td>
                          <td className="px-6 py-4" style={{ color: theme.colors.textPrimary }}>
                            <div className="max-w-xl">{question.questionText}</div>
                            {question.questionType === 'MCQ' && (
                              <div className="mt-2 text-xs flex flex-wrap gap-2" style={{ color: theme.colors.textSecondary }}>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">A: {question.optionA}</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">B: {question.optionB}</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">C: {question.optionC}</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">D: {question.optionD}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: question.questionType === 'MCQ' ? '#DBEAFE' : '#FEF3C7', color: question.questionType === 'MCQ' ? '#1E40AF' : '#92400E' }}>{question.questionType}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium capitalize" style={{ backgroundColor: question.difficultyLevel === 'easy' ? '#D1FAE5' : question.difficultyLevel === 'medium' ? '#FEF3C7' : '#FEE2E2', color: question.difficultyLevel === 'easy' ? '#065F46' : question.difficultyLevel === 'medium' ? '#92400E' : '#991B1B' }}>{question.difficultyLevel}</span>
                          </td>
                          <td className="px-6 py-4 font-semibold" style={{ color: theme.colors.textPrimary }}>{question.marks}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleEditClick(question)} className="p-2 rounded-lg text-white hover:scale-110 transition-transform" style={{ background: theme.colors.primary }} title="Edit"><Edit size={18} /></button>
                              <button onClick={() => setShowDeleteConfirm(question.id)} className="p-2 rounded-lg text-white hover:scale-110 transition-transform" style={{ background: '#EF4444' }} title="Delete"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        )}

        {(activeTab === 'create' || activeTab === 'edit') && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="px-8 py-6" style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%)` }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {activeTab === 'edit' ? <Edit size={28} /> : <Plus size={28} />}
                  {activeTab === 'edit' ? 'Edit Question' : 'Create New Question'}
                </h2>
              </div>
              <form onSubmit={activeTab === 'edit' ? handleUpdateQuestion : handleCreateQuestion} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>Question Type *</label>
                  <div className="flex gap-4">
                    {['MCQ', 'TEXT'].map(type => (
                      <label key={type} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.questionType === type ? 'border-current' : ''}`} style={{ borderColor: formData.questionType === type ? theme.colors.primary : theme.colors.border, background: formData.questionType === type ? `${theme.colors.primary}10` : 'transparent' }}>
                        <input type="radio" name="questionType" value={type} checked={formData.questionType === type} onChange={handleInputChange} className="hidden" />
                        <span className="font-medium" style={{ color: formData.questionType === type ? theme.colors.primary : theme.colors.textPrimary }}>{type === 'MCQ' ? 'Multiple Choice' : 'Text Answer'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Question Text *</label>
                  <textarea name="questionText" value={formData.questionText} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }} placeholder="Enter your question..." required />
                </div>
                {formData.questionType === 'MCQ' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>Options *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: theme.colors.primary }}>{opt}</span>
                          <input type="text" name={`option${opt}`} value={formData[`option${opt}`]} onChange={handleInputChange} className="flex-1 px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }} placeholder={`Option ${opt}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {formData.questionType === 'MCQ' ? (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Correct Answer *</label>
                    <select name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>
                      <option value="">Select correct answer</option>
                      <option value="optionA">A</option>
                      <option value="optionB">B</option>
                      <option value="optionC">C</option>
                      <option value="optionD">D</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Expected Answer *</label>
                    <textarea name="answerText" value={formData.answerText} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }} placeholder="Enter expected answer..." />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Difficulty Level</label>
                    <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleInputChange} className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Marks</label>
                    <input type="number" name="marks" value={formData.marks} onChange={handleInputChange} min="1" className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }} />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={submitting} className="flex-1 px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50 hover:shadow-lg flex items-center justify-center gap-2" style={{ background: theme.colors.primary }}>
                    {submitting ? (activeTab === 'edit' ? 'Updating...' : 'Creating...') : (activeTab === 'edit' ? 'Update Question' : 'Create Question')}
                  </button>
                  <button type="button" onClick={() => { setActiveTab('list'); resetForm(); setSelectedQuestion(null); }} className="flex-1 px-6 py-4 rounded-xl font-semibold border-2" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'excel' && !showExcelPreview && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="px-8 py-6" style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%)` }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><FileSpreadsheet size={28} />Import Questions from Excel</h2>
              </div>
              <div className="p-8 space-y-6">
                
                <button onClick={downloadSampleFormat} className="w-full px-6 py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg" style={{ background: theme.colors.primary }}><Download size={20} />Download Sample Template</button>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Select Excel/CSV File</label>
                  <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-blue-400" style={{ borderColor: theme.colors.border }}>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload size={40} className="mx-auto mb-3" style={{ color: theme.colors.primary }} />
                      <p className="font-medium" style={{ color: theme.colors.textPrimary }}>{selectedFile ? selectedFile.name : 'Click to upload Excel file'}</p>
                      <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Supported: .xlsx, .xls, .csv</p>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleExcelPreview} disabled={!selectedFile || previewLoading} className="flex-1 px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50 hover:shadow-lg flex items-center justify-center gap-2" style={{ background: theme.colors.primary }}>{previewLoading ? 'Loading...' : 'Preview Questions'}<ChevronRight size={20} /></button>
                  <button onClick={() => setActiveTab('list')} className="flex-1 px-6 py-4 rounded-xl font-semibold border-2" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showExcelPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-8 py-6" style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%)` }}>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><FileText size={28} />Preview Questions ({importedQuestions.length})</h2>
                <button onClick={() => { setShowExcelPreview(false); setSelectedFile(null); setImportedQuestions([]); }} className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30"><X size={24} /></button>
              </div>
            </div>
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr style={{ background: theme.colors.primary }}>
                    <th className="px-4 py-3 text-left text-white font-bold">S.No</th>
                    <th className="px-4 py-3 text-left text-white font-bold">Question</th>
                    <th className="px-4 py-3 text-left text-white font-bold">Type</th>
                    <th className="px-4 py-3 text-left text-white font-bold">Difficulty</th>
                    <th className="px-4 py-3 text-left text-white font-bold">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {importedQuestions.map((question, index) => (
                    <tr key={question.id || index} className="border-b" style={{ borderColor: theme.colors.border }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: theme.colors.textPrimary }}>{index + 1}</td>
                      <td className="px-4 py-3" style={{ color: theme.colors.textPrimary }}>
                        <div className="max-w-md">{question.questionText}</div>
                        {question.questionType === 'MCQ' && <div className="mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>A: {question.optionA} | B: {question.optionB} | C: {question.optionC} | D: {question.optionD}</div>}
                      </td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: question.questionType === 'MCQ' ? '#DBEAFE' : '#FEF3C7', color: question.questionType === 'MCQ' ? '#1E40AF' : '#92400E' }}>{question.questionType}</span></td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs font-medium capitalize" style={{ backgroundColor: question.difficultyLevel === 'easy' ? '#D1FAE5' : question.difficultyLevel === 'medium' ? '#FEF3C7' : '#FEE2E2', color: question.difficultyLevel === 'easy' ? '#065F46' : question.difficultyLevel === 'medium' ? '#92400E' : '#991B1B' }}>{question.difficultyLevel}</span></td>
                      <td className="px-4 py-3 font-semibold" style={{ color: theme.colors.textPrimary }}>{question.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-6 border-t flex gap-4" style={{ borderColor: theme.colors.border }}>
              <button onClick={handleSaveQuestions} disabled={uploading} className="flex-1 px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: theme.colors.primary }}><SaveIcon />{uploading ? 'Saving...' : 'Save Questions'}</button>
              <button onClick={handleDirectBuildTest} className="flex-1 px-6 py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2" style={{ background: '#10B981' }}><FileText size={20} />Direct Build Test</button>
              <button onClick={() => { setShowExcelPreview(false); setSelectedFile(null); setImportedQuestions([]); }} className="flex-1 px-6 py-4 rounded-xl font-semibold border-2" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showQuestionSelection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-8 py-6" style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%)` }}>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Build Test with Excel Questions</h2>
                <button onClick={() => setShowQuestionSelection(false)} className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30"><X size={24} /></button>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Test Title *</label><input type="text" name="title" value={testFormData.title} onChange={handleTestInputChange} className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border }} placeholder="Enter test title" required /></div>
                <div><label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Course *</label><select name="courseCode" value={testFormData.courseCode} onChange={handleTestInputChange} className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border }} required><option value="">Select a course</option>{teacherCourses.map(course => (<option key={course.id} value={course.courseCode}>{course.courseName} ({course.courseCode})</option>))}</select></div>
                <div><label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Duration (min) *</label><input type="number" name="durationMinutes" value={testFormData.durationMinutes} onChange={handleTestInputChange} min="1" className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border }} required /></div>
                <div><label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Max Attempts</label><input type="number" name="maxAttempts" value={testFormData.maxAttempts} onChange={handleTestInputChange} min="1" className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border }} /></div>
                <div><label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Start Time *</label><input type="datetime-local" name="startTime" value={testFormData.startTime} onChange={handleTestInputChange} className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border }} required /></div>
                <div><label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>End Time *</label><input type="datetime-local" name="endTime" value={testFormData.endTime} onChange={handleTestInputChange} className="w-full px-4 py-3 border-2 rounded-xl" style={{ borderColor: theme.colors.border }} required /></div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3"><label className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>Select Questions *</label><button type="button" onClick={handleSelectAllQuestions} className="text-sm font-medium" style={{ color: theme.colors.primary }}>{selectedQuestions.length === importedQuestions.length ? 'Deselect All' : 'Select All'}</button></div>
                <div className="border-2 rounded-xl max-h-48 overflow-y-auto" style={{ borderColor: theme.colors.border }}>
                  {importedQuestions.map((question, index) => {
                    const isSelected = selectedQuestions.some(q => (q.id || index) === (question.id || index));
                    return (
                      <div key={question.id || index} onClick={() => toggleQuestionSelection(question)} className="p-3 border-b flex items-center gap-3 cursor-pointer" style={{ borderColor: theme.colors.border, background: isSelected ? `${theme.colors.primary}10` : 'transparent' }}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-current' : ''}`} style={{ borderColor: isSelected ? theme.colors.primary : theme.colors.border, background: isSelected ? theme.colors.primary : 'transparent' }}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex-1"><p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{question.questionText?.substring(0, 60)}...</p><div className="flex gap-2 mt-1"><span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>{question.questionType}</span><span className="text-xs" style={{ color: theme.colors.textSecondary }}>Marks: {question.marks}</span></div></div>
                      </div>
                    );
                  })}
                </div>
                {selectedQuestions.length > 0 && <p className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>Selected {selectedQuestions.length} questions • Total Marks: {selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}</p>}
              </div>
            </div>
            <div className="px-8 py-6 border-t flex gap-4" style={{ borderColor: theme.colors.border }}>
              <button onClick={handleCreateTestSubmit} disabled={testSubmitting || selectedQuestions.length === 0} className="flex-1 px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: theme.colors.primary }}>{testSubmitting ? 'Creating...' : `Create Test (${selectedQuestions.length} questions)`}</button>
              <button onClick={() => setShowQuestionSelection(false)} className="flex-1 px-6 py-4 rounded-xl font-semibold border-2" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6" style={{ background: '#EF4444' }}><h2 className="text-xl font-bold text-white flex items-center gap-2"><Trash2 size={24} />Confirm Delete</h2></div>
            <div className="p-6"><p className="mb-6" style={{ color: theme.colors.textPrimary }}>Are you sure you want to delete this question? This action cannot be undone.</p><div className="flex gap-4"><button onClick={() => handleDeleteQuestion(showDeleteConfirm)} className="flex-1 px-4 py-3 rounded-xl text-white font-medium" style={{ background: '#EF4444' }}>Delete</button><button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-3 rounded-xl font-medium border-2" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>Cancel</button></div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;

