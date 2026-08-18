import "./course.css";
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseByCode, updateSuperAdminCourse } from "../../services/api";
import { FileUploadZone } from "../../components/FileUploadZone";

const EMPTY_COURSE = {
  courseCode: '',
  courseName: '',
  courseDescription: '',
  courseDuration: 0,
  difficulty: 'Beginner',
  courseType: 'academic',
  rating: 0,
  mrp: 0,
  discountedprice: 0,
  status: 'Active',
  totalenrollment: 0,
  deadline: '',
  courseStartDate: '',
  board: '',
  medium: '',
  classname: '',
  subject: '',
  subjectCode: '',
  stream: '',
  category: '',
  subcategory: '',
  targetAudience: '',
  prerequisites: '',
  learningOutcomes: '',
  certificationAvailable: false,
  language: '',
  introVideo: '',
  thumbnail: '',
  syllabusUrl: '',
};

export default function CourseInfo() {
  const { code } = useParams();
  const [course, setCourse] = useState(EMPTY_COURSE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    getCourseByCode(code)
      .then((res) => {
        const d = res?.data || res || {};
        setCourse({
          ...EMPTY_COURSE,
          ...d,
          thumbnailFile: null,
          introVideoFile: null,
          syllabusFile: null,
        });
      })
      .catch((err) => setError(err.message || 'Failed to load course details'))
      .finally(() => setLoading(false));
  }, [code]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      Object.keys(course).forEach((key) => {
        if (['thumbnailFile', 'introVideoFile', 'syllabusFile'].includes(key)) return;
        if (course[key] !== null && course[key] !== undefined) {
          fd.append(key, course[key]);
        }
      });
      if (course.thumbnailFile) fd.append('thumbnail', course.thumbnailFile);
      if (course.introVideoFile) fd.append('introVideo', course.introVideoFile);
      if (course.syllabusFile) fd.append('syllabusFile', course.syllabusFile);

      await updateSuperAdminCourse(code, fd);
      setSuccess('Course updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading course info...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Course: {course.courseName || code}</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Code</label>
            <input type="text" name="courseCode" value={course.courseCode} disabled className="mt-1 block w-full border rounded-md p-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Name</label>
            <input type="text" name="courseName" value={course.courseName} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Board</label>
            <input type="text" name="board" value={course.board} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Class/Grade</label>
            <input type="text" name="classname" value={course.classname} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input type="text" name="subject" value={course.subject} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Code</label>
            <input type="text" name="subjectCode" value={course.subjectCode} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">MRP ($)</label>
            <input type="number" name="mrp" value={course.mrp} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discounted Price ($)</label>
            <input type="number" name="discountedprice" value={course.discountedprice} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select name="difficulty" value={course.difficulty} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Type</label>
            <select name="courseType" value={course.courseType} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2">
              <option value="academic">Academic</option>
              <option value="competitive">Competitive</option>
              <option value="skill">Skill</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="courseDescription" value={course.courseDescription} onChange={handleChange} rows={4} className="mt-1 block w-full border rounded-md p-2" />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold text-gray-700">Media & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FileUploadZone
              label="Course Thumbnail Image"
              accept="image/*"
              currentUrl={course.thumbnail}
              onFileSelect={(f) => setCourse((prev) => ({ ...prev, thumbnail: f ? URL.createObjectURL(f) : '', thumbnailFile: f }))}
            />

            <FileUploadZone
              label="Course Intro Video"
              accept="video/*"
              fileName={course.introVideo}
              onFileSelect={(f) => setCourse((prev) => ({ ...prev, introVideo: f ? f.name : '', introVideoFile: f }))}
            />

            <FileUploadZone
              label="Syllabus Document (PDF)"
              accept="application/pdf"
              fileName={course.syllabusUrl}
              onFileSelect={(f) => setCourse((prev) => ({ ...prev, syllabusUrl: f ? f.name : '', syllabusFile: f }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all">{saving ? 'Saving Changes...' : 'Save Changes'}</button>
          <button type="button" onClick={() => window.location.reload()} className="px-6 py-2.5 border rounded-lg hover:bg-slate-50 font-medium text-slate-600 transition-all">Cancel</button>
        </div>
      </form>
    </div>
  );
}
