import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSuperAdminClassHierarchy,
  createSubject,
  createCourse,
  getAllClasses,
  createClass,
  getAllSubjects,
} from '../services/api';

function AddSubjectModal({ isOpen, onClose, className, onAdd }) {
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    await onAdd({
      subjectName: subjectName.trim(),
      ForClass: className,
      description: description.trim(),
      language,
    });

    setSubjectName('');
    setDescription('');
    setLanguage('English');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Subject</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subject Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g., Physics"
                className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional description"
                className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!subjectName.trim()}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddCourseModal({ isOpen, onClose, className, classOptions, onAdd }) {
  const [formData, setFormData] = useState({
    courseName: '',
    courseType: 'academic',
    courseDescription: '',
    difficulty: 'Beginner',
    mrp: '',
    discountedprice: '',
    courseStartDate: '',
    deadline: '',
    courseDuration: '',
    board: '',
    medium: '',
    classname: className || '',
    subject: '',
    stream: '',
    category: '',
    subcategory: '',
    targetAudience: '',
    totalLessons: '',
    thumbnail: null,
    introVideo: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [showCustomClassInput, setShowCustomClassInput] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [customClassDescription, setCustomClassDescription] = useState('');
  const [showAddSubjectInput, setShowAddSubjectInput] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [newSubjectLanguage, setNewSubjectLanguage] = useState('English');
  const [creatingClassLoading, setCreatingClassLoading] = useState(false);
  const [creatingSubjectLoading, setCreatingSubjectLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        classname: className || prev.classname,
      }));
    }
  }, [isOpen, className]);

  useEffect(() => {
    if (!isOpen) return;

    const loadSubjects = async () => {
      try {
        const response = await getAllSubjects();
        const allSubjects = response?.data || response || [];
        const classSubjects = allSubjects.filter((subject) => subject.ForClass === (formData.classname || className));
        setSubjects(classSubjects);
      } catch (error) {
        setSubjects([]);
      }
    };

    loadSubjects();
  }, [isOpen, formData.classname, className]);

  const getFilteredSubjects = () => {
    if (!formData.classname) return [];
    return subjects.filter((subject) => subject.ForClass === formData.classname);
  };

  const resetState = () => {
    setFormData({
      courseName: '',
      courseType: 'academic',
      courseDescription: '',
      difficulty: 'Beginner',
      mrp: '',
      discountedprice: '',
      courseStartDate: '',
      deadline: '',
      courseDuration: '',
      board: '',
      medium: '',
      classname: className || '',
      subject: '',
      stream: '',
      category: '',
      subcategory: '',
      targetAudience: '',
      totalLessons: '',
      thumbnail: null,
      introVideo: null,
    });
    setFieldErrors({});
    setShowCustomClassInput(false);
    setCustomClassName('');
    setCustomClassDescription('');
    setShowAddSubjectInput(false);
    setNewSubjectName('');
    setNewSubjectDescription('');
    setNewSubjectLanguage('English');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setShowCustomClassInput(true);
      setFormData((prev) => ({ ...prev, classname: '', subject: '' }));
      return;
    }

    setShowCustomClassInput(false);
    setFormData((prev) => ({ ...prev, classname: value, subject: '' }));
  };

  const handleCreateNewClass = async () => {
    if (!customClassName.trim()) return;

    setCreatingClassLoading(true);
    try {
      const classDescription = customClassDescription.trim() || `Class ${customClassName}`;
      const response = await createClass({
        className: customClassName,
        class_description: classDescription,
      });
      const createdClass = response?.data || response;

      if (createdClass) {
        setFormData((prev) => ({ ...prev, classname: createdClass.className || customClassName, subject: '' }));
        setShowCustomClassInput(false);
        setCustomClassName('');
        setCustomClassDescription('');
      }
    } catch (error) {
      console.error('Class create failed', error);
    } finally {
      setCreatingClassLoading(false);
    }
  };

  const handleCreateNewSubject = async () => {
    if (!newSubjectName.trim() || !formData.classname) return;

    setCreatingSubjectLoading(true);
    try {
      const response = await createSubject({
        subjectName: newSubjectName,
        ForClass: formData.classname,
        description: newSubjectDescription.trim() || '',
        language: newSubjectLanguage,
      });
      const createdSubject = response?.data || response;

      if (createdSubject) {
        setSubjects((prev) => [...prev, createdSubject]);
        setFormData((prev) => ({ ...prev, subject: createdSubject.subjectName || newSubjectName }));
        setShowAddSubjectInput(false);
        setNewSubjectName('');
        setNewSubjectDescription('');
        setNewSubjectLanguage('English');
      }
    } catch (error) {
      console.error('Subject create failed', error);
    } finally {
      setCreatingSubjectLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.courseName.trim()) errors.courseName = true;
    if (!formData.courseType) errors.courseType = true;
    if (!formData.courseDescription.trim()) errors.courseDescription = true;
    if (!formData.difficulty) errors.difficulty = true;
    if (!formData.courseStartDate) errors.courseStartDate = true;
    if (!formData.deadline) errors.deadline = true;
    if (!formData.courseDuration) errors.courseDuration = true;
    if (formData.courseType === 'academic') {
      if (!formData.classname) errors.classname = true;
      if (!formData.subject) errors.subject = true;
    }

    if (formData.deadline && formData.courseStartDate && formData.deadline < formData.courseStartDate) {
      errors.deadline = 'Deadline cannot be earlier than start date';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        mrp: formData.mrp === '' ? 0 : Number(formData.mrp),
        discountedprice: formData.discountedprice === '' ? 0 : Number(formData.discountedprice),
        courseDuration: Number(formData.courseDuration),
        totalLessons: formData.totalLessons === '' ? 0 : Number(formData.totalLessons),
      };

      await onAdd(payload);
      resetState();
      onClose();
    } catch (error) {
      console.error('Course creation failed', error);
    }
  };

  const selectedClassOptions = classOptions || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Add Course</h2>
          <button type="button" onClick={handleClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Course Name *</label>
              <input
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 ${fieldErrors.courseName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter course name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Course Type *</label>
              <select
                value={formData.courseType}
                onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 ${fieldErrors.courseType ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="academic">Academic</option>
                <option value="non-academic">Non-Academic</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Difficulty *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 ${fieldErrors.difficulty ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">MRP (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Discounted Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountedprice}
                onChange={(e) => setFormData({ ...formData, discountedprice: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Course Start Date *</label>
              <input
                type="date"
                value={formData.courseStartDate}
                onChange={(e) => setFormData({ ...formData, courseStartDate: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 ${fieldErrors.courseStartDate ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Deadline *</label>
              <input
                type="date"
                min={formData.courseStartDate || undefined}
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 ${fieldErrors.deadline ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Course Duration (days) *</label>
              <input
                type="number"
                min="1"
                value={formData.courseDuration}
                onChange={(e) => setFormData({ ...formData, courseDuration: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 ${fieldErrors.courseDuration ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Total Lessons</label>
              <input
                type="number"
                min="0"
                value={formData.totalLessons}
                onChange={(e) => setFormData({ ...formData, totalLessons: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {formData.courseType === 'academic' && (
            <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Board</label>
                <input
                  value={formData.board}
                  onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter board"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Medium</label>
                <input
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter medium"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Class Level *</label>
                <select
                  value={formData.classname || 'Select'}
                  onChange={handleClassChange}
                  className={`w-full rounded-md border px-3 py-2 ${fieldErrors.classname ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Class</option>
                  {(selectedClassOptions || []).map((cls) => (
                    <option key={cls.className || cls.classLevel || cls.id} value={cls.className || cls.classLevel}>
                      {cls.className || cls.classLevel}
                    </option>
                  ))}
                  <option value="Other">+ Add New Class</option>
                </select>

                {showCustomClassInput && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customClassName}
                        onChange={(e) => setCustomClassName(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                        placeholder="New class name"
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewClass}
                        disabled={creatingClassLoading}
                        className="rounded-md bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {creatingClassLoading ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customClassDescription}
                      onChange={(e) => setCustomClassDescription(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Class description (optional)"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'AddNew') {
                      setShowAddSubjectInput(true);
                      setFormData((prev) => ({ ...prev, subject: '' }));
                    } else {
                      setShowAddSubjectInput(false);
                      setFormData((prev) => ({ ...prev, subject: value }));
                    }
                  }}
                  className={`w-full rounded-md border px-3 py-2 ${fieldErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Subject</option>
                  {getFilteredSubjects().map((subject) => (
                    <option key={subject.subjectCode} value={subject.subjectName}>
                      {subject.subjectName}
                    </option>
                  ))}
                  {formData.classname && <option value="AddNew">+ Add New Subject</option>}
                </select>

                {showAddSubjectInput && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                        placeholder="New subject name"
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewSubject}
                        disabled={creatingSubjectLoading}
                        className="rounded-md bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {creatingSubjectLoading ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newSubjectDescription}
                      onChange={(e) => setNewSubjectDescription(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Subject description (optional)"
                    />
                    <select
                      value={newSubjectLanguage}
                      onChange={(e) => setNewSubjectLanguage(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Stream</label>
                <input
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter stream"
                />
              </div>
            </div>
          )}

          {formData.courseType === 'non-academic' && (
            <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter category"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subcategory</label>
                <input
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter subcategory"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Target Audience</label>
                <input
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter target audience"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Course Description *</label>
            <textarea
              value={formData.courseDescription}
              onChange={(e) => setFormData({ ...formData, courseDescription: e.target.value })}
              rows={4}
              className={`w-full rounded-md border px-3 py-2 ${fieldErrors.courseDescription ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter course description"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <button type="button" onClick={handleClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
          <button type="button" onClick={handleSubmit} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function ClassDetails() {
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState('subjects');
  const [courseSearch, setCourseSearch] = useState('');
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHierarchy = async () => {
      if (!classId) return;

      try {
        setLoading(true);
        setError('');
        const response = await getSuperAdminClassHierarchy(classId);
        setHierarchy(response?.data || response || null);
      } catch (err) {
        setHierarchy(null);
        setError(err.message || 'Unable to load class hierarchy.');
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, [classId]);

  useEffect(() => {
    const fetchClassOptions = async () => {
      try {
        const response = await getAllClasses();
        setClassOptions(response?.data || response || []);
      } catch (error) {
        setClassOptions([]);
      }
    };

    fetchClassOptions();
  }, []);

  const currentClass = hierarchy || { className: 'Class Details', status: 'ACTIVE' };
  const subjects = hierarchy?.subjects || [];

  const handleAddSubject = async (payload) => {
    try {
      const response = await createSubject(payload);
      const createdSubject = response?.data || response;

      if (!createdSubject) return;

      setHierarchy((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subjects: [...(prev.subjects || []), createdSubject],
        };
      });
    } catch (err) {
      setError(err.message || 'Unable to add subject.');
      throw err;
    }
  };

  const handleAddCourse = async (payload) => {
    try {
      const response = await createCourse(payload);
      const createdCourse = response?.data || response;

      if (!createdCourse) return;

      setHierarchy((prev) => {
        if (!prev) return prev;

        const nextSubjects = [...(prev.subjects || [])];
        const targetSubjectIndex = nextSubjects.findIndex((subject) => subject.subjectName === createdCourse.subject || subject.subjectCode === createdCourse.subjectCode);

        if (targetSubjectIndex >= 0) {
          nextSubjects[targetSubjectIndex] = {
            ...nextSubjects[targetSubjectIndex],
            courses: [...(nextSubjects[targetSubjectIndex].courses || []), createdCourse],
          };
        } else {
          nextSubjects.push({
            subjectName: createdCourse.subject,
            subjectCode: createdCourse.subjectCode || 'NEW',
            courses: [createdCourse],
          });
        }

        return {
          ...prev,
          subjects: nextSubjects,
        };
      });
    } catch (err) {
      setError(err.message || 'Unable to add course.');
      throw err;
    }
  };

  const flattenedCourses = subjects.flatMap((subject) =>
    (subject.courses || []).map((course) => ({
      ...course,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
    }))
  );

  const filteredCourses = flattenedCourses.filter((course) => {
    if (!courseSearch) return true;
    const q = courseSearch.toLowerCase();
    return (
      (course.courseName || '').toLowerCase().includes(q) ||
      (course.subjectName || '').toLowerCase().includes(q) ||
      (course.courseCode || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Class Details <span className="text-gray-400 font-normal mx-2">|</span> {currentClass.className}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage subjects and courses for {currentClass.className} (ID: {classId})
            </p>
          </div>

          <div className="flex space-x-3">
            {activeTab === 'subjects' && (
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                + Add Subject
              </button>
            )}

            {activeTab === 'courses' && (
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                + Add Course
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-40 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'subjects'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Subjects
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'courses'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Courses
              </button>
            </nav>
          </div>

          <div className="flex-1 min-w-0">
            <AddSubjectModal
              isOpen={showAddSubjectModal}
              onClose={() => setShowAddSubjectModal(false)}
              className={currentClass.className}
              onAdd={handleAddSubject}
            />

            <AddCourseModal
              isOpen={showAddCourseModal}
              onClose={() => setShowAddCourseModal(false)}
              className={currentClass.className}
              classOptions={classOptions}
              onAdd={handleAddCourse}
            />

            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
              {error && (
                <div className="p-6 text-red-700 bg-red-50 border-b border-red-200">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="p-6 text-gray-500">Loading class details...</div>
              ) : activeTab === 'subjects' ? (
                <div className="p-6 bg-gray-50/50">
                  {subjects.length === 0 ? (
                    <div className="text-gray-500">No subjects found for this class.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subjects.map((subject) => (
                        <div
                          key={subject.subjectCode}
                          onClick={() => navigate(`/subjects/${subject.subjectCode}`)}
                          className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex items-center space-x-4 hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg">
                            {(subject.subjectName || 'S').charAt(0)}
                          </div>
                          <span className="text-gray-800 font-medium truncate">
                            {subject.subjectName}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg border">
                  <div className="p-3 sm:p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full max-w-xs pl-3 pr-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto h-[60vh] overflow-y-auto relative">
                    <table className="w-full text-sm table-fixed">
                      <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                        <tr className="whitespace-nowrap">
                          <th className="px-6 py-4 text-left font-medium">Course Name</th>
                          <th className="px-6 py-4 text-left font-medium">Subject</th>
                          <th className="px-6 py-4 text-left font-medium">Enrolled Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                              No courses found
                            </td>
                          </tr>
                        ) : (
                          filteredCourses.map((course) => (
                            <tr
                              key={course.courseCode}
                              className="border-t hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                              onClick={() => navigate(`/courses/${course.courseCode}`)}
                            >
                              <td className="px-6 py-4 font-medium">
                                <div className="text-gray-900">{course.courseName}</div>
                                <div className="text-xs text-gray-500">{course.courseCode}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{course.subjectName}</td>
                              <td className="px-6 py-4 text-gray-600">{course.enrolledStudentCount}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}