import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseByCode, updateSuperAdminCourse } from '../services/api';

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
  totalLessons: 0,
  totalReviews: 0,
  thumbnail: '',
  introVideo: '',
  syllabusUrl: '',
};

export default function CourseInfo() {
  const { courseCode } = useParams();
  const [course, setCourse] = useState(EMPTY_COURSE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseCode) return;

      try {
        setLoading(true);
        setError('');
        const response = await getCourseByCode(courseCode);
        const data = response?.data || response || EMPTY_COURSE;
        setCourse({
          ...EMPTY_COURSE,
          ...data,
          courseCode: data.courseCode || courseCode,
        });
      } catch (err) {
        setError(err.message || 'Unable to load course details.');
        setCourse({ ...EMPTY_COURSE, courseCode });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseCode]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!courseCode) return;

    try {
      setSaving(true);
      setError('');

      const payload = {
        courseName: course.courseName,
        courseType: course.courseType,
        courseDescription: course.courseDescription,
        difficulty: course.difficulty,
        mrp: Number(course.mrp || 0),
        discountedprice: Number(course.discountedprice || 0),
        status: course.status,
        totalenrollment: Number(course.totalenrollment || 0),
        totalLessons: Number(course.totalLessons || 0),
        courseDuration: Number(course.courseDuration || 0),
        courseStartDate: course.courseStartDate,
        deadline: course.deadline,
        board: course.board,
        medium: course.medium,
        classname: course.classname,
        subject: course.subject,
        subjectCode: course.subjectCode,
        stream: course.stream,
        category: course.category,
        subcategory: course.subcategory,
        targetAudience: course.targetAudience,
        thumbnail: course.thumbnail,
        introVideo: course.introVideo,
      };

      await updateSuperAdminCourse(courseCode, payload);
      alert('Course updated successfully');
    } catch (err) {
      setError(err.message || 'Unable to save course changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-4">Edit Course Info</h1>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Code</label>
              <input value={course.courseCode || ''} readOnly className="mt-1 block w-full border rounded-md p-2 bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Type</label>
              <select value={course.courseType || 'academic'} onChange={(e) => setCourse({ ...course, courseType: e.target.value })} className="mt-1 block w-full border rounded-md p-2">
                <option value="academic">academic</option>
                <option value="non-academic">non-academic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Name</label>
              <input value={course.courseName || ''} onChange={(e) => setCourse({ ...course, courseName: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input readOnly value={course.rating || 0} className="mt-1 block w-full border rounded-md p-2 bg-gray-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Syllabus / Description</label>
              <textarea value={course.courseDescription || ''} onChange={(e) => setCourse({ ...course, courseDescription: e.target.value })} rows={4} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select value={course.difficulty || 'Beginner'} onChange={(e) => setCourse({ ...course, difficulty: e.target.value })} className="mt-1 block w-full border rounded-md p-2">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">MRP</label>
              <input type="number" step="0.01" value={course.mrp || 0} onChange={(e) => setCourse({ ...course, mrp: Number(e.target.value) })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discounted Price</label>
              <input type="number" step="0.01" value={course.discountedprice || 0} onChange={(e) => setCourse({ ...course, discountedprice: Number(e.target.value) })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={course.status || 'Active'} onChange={(e) => setCourse({ ...course, status: e.target.value })} className="mt-1 block w-full border rounded-md p-2">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Enrollment</label>
              <input type="number" value={course.totalenrollment || 0} onChange={(e) => setCourse({ ...course, totalenrollment: Number(e.target.value) })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Lessons</label>
              <input type="number" value={course.totalLessons || 0} onChange={(e) => setCourse({ ...course, totalLessons: Number(e.target.value) })} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Reviews</label>
              <input type="number" value={course.totalReviews || 0} onChange={(e) => setCourse({ ...course, totalReviews: Number(e.target.value) })} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Course Duration (days)</label>
              <input type="number" value={course.courseDuration || 0} onChange={(e) => setCourse({ ...course, courseDuration: Number(e.target.value) })} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Course Start Date</label>
              <input type="datetime-local" value={course.courseStartDate || ''} onChange={(e) => setCourse({ ...course, courseStartDate: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <input type="date" value={course.deadline || ''} onChange={(e) => setCourse({ ...course, deadline: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Board</label>
              <input value={course.board || ''} onChange={(e) => setCourse({ ...course, board: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medium</label>
              <input value={course.medium || ''} onChange={(e) => setCourse({ ...course, medium: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <input value={course.classname || ''} onChange={(e) => setCourse({ ...course, classname: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input value={course.subject || ''} onChange={(e) => setCourse({ ...course, subject: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject Code</label>
              <input value={course.subjectCode || ''} onChange={(e) => setCourse({ ...course, subjectCode: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stream</label>
              <input value={course.stream || ''} onChange={(e) => setCourse({ ...course, stream: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input value={course.category || ''} onChange={(e) => setCourse({ ...course, category: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subcategory</label>
              <input value={course.subcategory || ''} onChange={(e) => setCourse({ ...course, subcategory: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Target Audience</label>
              <input value={course.targetAudience || ''} onChange={(e) => setCourse({ ...course, targetAudience: e.target.value })} className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; setCourse({ ...course, thumbnail: f ? URL.createObjectURL(f) : '', thumbnailFile: f }); }} className="mt-1 block w-full" />
              {course.thumbnail && <img src={course.thumbnail} alt="thumb" className="mt-2 w-40 h-24 object-cover rounded-md" />}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Intro Video</label>
              <input type="file" accept="video/*" onChange={(e) => { const f = e.target.files[0]; setCourse({ ...course, introVideo: f ? f.name : '', introVideoFile: f }); }} className="mt-1 block w-full" />
              {course.introVideo && <div className="mt-2 text-sm text-gray-500">{course.introVideo}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Syllabus (PDF)</label>
              <input type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files[0]; setCourse({ ...course, syllabusUrl: f ? f.name : '', syllabusFile: f }); }} className="mt-1 block w-full" />
              {course.syllabusUrl && <div className="mt-2 text-sm text-gray-500">{course.syllabusUrl}</div>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md">{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 border rounded-md">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
