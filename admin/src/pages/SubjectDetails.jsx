import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSuperAdminSubjectCourses,
  createCourse,
  getAllClasses,
  getAllSubjects,
  createClass,
  createSubject,
} from '../services/api';

function AddCourseModal({ isOpen, onClose, subjectId, subjectName, onCourseCreated }) {
  const [formData, setFormData] = useState({
    courseName: '',
    courseType: 'academic',
    courseDescription: '',
    thumbnail: null,
    introVideo: null,
    difficulty: 'Beginner',
    mrp: '',
    discountedprice: '',
    courseStartDate: '',
    deadline: '',
    courseDuration: '',
    board: '',
    medium: '',
    classname: '',
    subject: subjectName || '',
    stream: '',
    category: '',
    subcategory: '',
    targetAudience: '',
    totalLessons: '',
  });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showCustomClassInput, setShowCustomClassInput] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [customClassDescription, setCustomClassDescription] = useState('');
  const [showAddSubjectInput, setShowAddSubjectInput] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [newSubjectLanguage, setNewSubjectLanguage] = useState('English');
  const [creatingClassLoading, setCreatingClassLoading] = useState(false);
  const [creatingSubjectLoading, setCreatingSubjectLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) => ({
      ...prev,
      subject: subjectName || prev.subject,
    }));
  }, [isOpen, subjectName]);

  useEffect(() => {
    if (!isOpen) return;

    const loadMeta = async () => {
      try {
        const classesRes = await getAllClasses();
        setClasses(classesRes?.data || classesRes || []);

        const subjectsRes = await getAllSubjects();
        setSubjects(subjectsRes?.data || subjectsRes || []);
      } catch (error) {
        setClasses([]);
        setSubjects([]);
      }
    };

    loadMeta();
  }, [isOpen]);

  if (!isOpen) return null;

  const getFilteredSubjects = () => {
    if (!formData.classname) return [];
    return subjects.filter((subject) => subject.ForClass === formData.classname);
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setShowCustomClassInput(true);
      setFormData((prev) => ({ ...prev, classname: '', subject: subjectName || '' }));
      return;
    }

    setShowCustomClassInput(false);
    setFormData((prev) => ({ ...prev, classname: value, subject: subjectName || '' }));
  };

  const handleCreateNewClass = async () => {
    if (!customClassName.trim()) return;

    setCreatingClassLoading(true);
    try {
      const response = await createClass({
        className: customClassName,
        class_description: customClassDescription.trim() || `Class ${customClassName}`,
      });
      const createdClass = response?.data || response;
      if (createdClass) {
        setClasses((prev) => [...prev, createdClass]);
        setFormData((prev) => ({ ...prev, classname: createdClass.className || customClassName, subject: subjectName || '' }));
      }
      setShowCustomClassInput(false);
      setCustomClassName('');
      setCustomClassDescription('');
    } catch (error) {
      console.error('Failed to create class', error);
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
      }
      setShowAddSubjectInput(false);
      setNewSubjectName('');
      setNewSubjectDescription('');
      setNewSubjectLanguage('English');
    } catch (error) {
      console.error('Failed to create subject', error);
    } finally {
      setCreatingSubjectLoading(false);
    }
  };

  const handleSubmit = async () => {
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

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        subject: formData.subject || subjectName,
        mrp: formData.mrp === '' ? 0 : Number(formData.mrp),
        discountedprice: formData.discountedprice === '' ? 0 : Number(formData.discountedprice),
        courseDuration: Number(formData.courseDuration),
        totalLessons: formData.totalLessons === '' ? 0 : Number(formData.totalLessons),
      };

      await createCourse(payload);
      onCourseCreated?.();
      setFormData({
        courseName: '',
        courseType: 'academic',
        courseDescription: '',
        thumbnail: null,
        introVideo: null,
        difficulty: 'Beginner',
        mrp: '',
        discountedprice: '',
        courseStartDate: '',
        deadline: '',
        courseDuration: '',
        board: '',
        medium: '',
        classname: '',
        subject: subjectName || '',
        stream: '',
        category: '',
        subcategory: '',
        targetAudience: '',
        totalLessons: '',
      });
      setFieldErrors({});
      onClose();
    } catch (error) {
      console.error('Course creation failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Add Course</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
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
                  {classes.map((cls) => (
                    <option key={cls.className || cls.id} value={cls.className || cls.classLevel}>
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
                  value={formData.subject || ''}
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
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubjectDetails() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  const fetchCourses = async () => {
    if (!subjectId) return;

    try {
      setLoading(true);
      setError('');
      const response = await getSuperAdminSubjectCourses(subjectId);
      const rows = Array.isArray(response) ? response : response?.data || [];
      setCourses(rows);
    } catch (err) {
      setCourses([]);
      setError(err.message || 'Unable to load courses for this subject.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [subjectId]);

  const subjectName = courses[0]?.subject || courses[0]?.subjectName || subjectId || 'Unknown Subject';

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden p-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{subjectName}</h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
              <span>Manage courses under this subject</span>
              <span className="text-gray-300">|</span>
              <span>ID: <span className="font-medium text-gray-800">{subjectId}</span></span>
            </p>
          </div>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            + Add New Course
          </button>
        </div>

        <AddCourseModal
          isOpen={showAddCourseModal}
          onClose={() => setShowAddCourseModal(false)}
          subjectId={subjectId}
          subjectName={subjectName}
          onCourseCreated={fetchCourses}
        />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Assigned Course</h2>
          <p className="text-sm text-gray-500 mt-1">Select the course to view or edit its details.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            Loading courses...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.courseCode}
                onClick={() => navigate(`/course_info/${course.courseCode}`)}
                className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md hover:ring-blue-300 transition-all duration-200 cursor-pointer flex flex-col"
              >
                <div className="h-48 w-full bg-gray-200 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Thumbnail
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm">
                    {course.courseCode}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={course.courseName}>
                      {course.courseName}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty || 'N/A'}
                    </span>
                    {typeof course.rating === 'number' && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        ★ {Number(course.rating).toFixed(1)}
                      </span>
                    )}
                    {course.courseDuration && (
                      <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {course.courseDuration} Days
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                    {course.courseDescription}
                  </p>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-lg font-bold text-gray-900">₹{Number(course.discountedprice || 0)}</span>
                      {Number(course.mrp || 0) > Number(course.discountedprice || 0) && (
                        <span className="text-xs text-gray-400 line-through ml-2">₹{Number(course.mrp || 0)}</span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      {Number(course.totalenrollment || 0).toLocaleString()} students
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && courses.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg ring-1 ring-gray-200">
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new course for {subjectName}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
