import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { createLiveSession } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, DEFAULT_BANNER_IMAGE } from '../utils/image';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    maxParticipants: 100,
    isPrivate: false,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/teachers/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCourses(result.data);
      } else {
        toast.error('Failed to fetch courses');
      }
    } catch (error) {
      toast.error('Error fetching courses');
    } finally {
      setLoading(false);
    }
  };



  const handleScheduleClass = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

 

  const handleSubmitSession = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const teacherId = user.teacherId;

    // Validate that start time is not in the past
    if (sessionData.startTime) {
      if (new Date(sessionData.startTime) < new Date()) {
        toast.error('Start time cannot be in the past');
        setIsSubmitting(false);
        return;
      }
    }

    // Validate that end time is after start time
    if (sessionData.startTime && sessionData.endTime) {
      const startDate = new Date(sessionData.startTime);
      const endDate = new Date(sessionData.endTime);
      
      if (endDate <= startDate) {
        toast.error('End time must be after start time');
        setIsSubmitting(false);
        return;
      }
    }

    // Send the datetime-local value directly - backend will handle UTC conversion
    // DO NOT convert to ISO string here as it causes timezone issues

    const formData = new FormData();
    formData.append('courseCode', selectedCourse.courseCode);
    formData.append('teacherId', teacherId);
    formData.append('title', sessionData.title);
    formData.append('description', sessionData.description);
    formData.append('startTime', sessionData.startTime);
    formData.append('endTime', sessionData.endTime);
    formData.append('maxParticipants', sessionData.maxParticipants || 100);
    formData.append('isPrivate', sessionData.isPrivate);

    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    await createLiveSession(formData);
      toast.success('Live session scheduled successfully!');
      setShowModal(false);
      setSessionData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        maxParticipants: 100,
        isPrivate: false,
      });
      setThumbnail(null);
    } catch (error) {
      console.error('Error scheduling live session:', error);
      toast.error('Failed to schedule live session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 p-4">
        <div className="text-lg" style={{ color: theme.colors.textSecondary }}>Loading courses...</div>
      </div>
    );
  }
     return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* PAGE CONTAINER */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-20 py-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <h1
            className="text-2xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            Allotted Courses
          </h1>
          <p
            className="text-sm sm:text-base xl:text-lg"
            style={{ color: theme.colors.textSecondary }}
          >
            Courses assigned to you
          </p>
        </div>

        {/* EMPTY STATE */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="text-6xl mb-4"
              style={{ color: theme.colors.primary }}
            >
              📚
            </div>
            <p
              className="text-lg font-medium"
              style={{ color: theme.colors.textSecondary }}
            >
              No courses assigned yet
            </p>
          </div>
        ) : (
          /* COURSE GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.courseCode}
                className="rounded-xl border shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                style={{
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                }}
                onClick={() => navigate(`/course-detail/${course.courseCode}`, { state: { course } })}
              >
                {/* THUMBNAIL */}
                <div className="relative">
                  <img
                    src={getImageUrl(course.thumbnail || course.image || course.banner)}
                    alt={course.courseName || course.title || "Course"}
                    className="w-full h-44 sm:h-48 xl:h-52 object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = DEFAULT_BANNER_IMAGE;
                    }}
                  />
                  {course.status === "Active" && (
                    <div
                      className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: theme.colors.success }}
                    >
                      ACTIVE
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-5 flex flex-col gap-3">
                  {/* FIRST ROW: NAME AND CODE */}
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-lg font-semibold line-clamp-2 flex-1"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {course.courseName}
                    </h3>
                    <span
                      className="text-xs font-semibold tracking-wide ml-2"
                      style={{ color: theme.colors.primary }}
                    >
                      {course.courseCode}
                    </span>
                  </div>

                  {/* SECOND ROW: DESCRIPTION */}
                  <p
                    className="text-sm line-clamp-3"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {course.courseDescription || "No description available"}
                  </p>

                  {/* BUTTONS */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScheduleClass(course);
                      }}
                      className="flex-1 px-2 py-2 text-white rounded hover:opacity-90 transition-colors text-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      Schedule Class
                    </button>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Schedule Live Session</h2>
              <form onSubmit={handleSubmitSession}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={sessionData.title}
                    onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={sessionData.description}
                    onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="w-full p-2 border rounded"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    value={sessionData.startTime}
                    onChange={(e) => setSessionData({ ...sessionData, startTime: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    min={sessionData.startTime || new Date().toISOString().slice(0, 16)}
                    value={sessionData.endTime}
                    onChange={(e) => setSessionData({ ...sessionData, endTime: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {/* Max Participants input commented out as requested */}
                {/* 
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={sessionData.maxParticipants || 100}
                    onChange={(e) => setSessionData({ ...sessionData, maxParticipants: parseInt(e.target.value) || 100 })}
                    className="w-full p-2 border rounded"
                    min="1"
                    disabled={isSubmitting}
                  />
                </div>
                */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sessionData.isPrivate}
                      onChange={(e) => setSessionData({ ...sessionData, isPrivate: e.target.checked })}
                      className="mr-2"
                      disabled={isSubmitting}
                    />
                    Private Session
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scheduling...
                      </>
                    ) : (
                      'Schedule'
                    )}
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

export default Courses;