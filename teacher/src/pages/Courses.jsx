import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { createLiveSession, getTeacherCourses } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, DEFAULT_BANNER_IMAGE } from '../utils/image';
import { ClassCreationModal } from '../components/ClassCreationModal';
import Pagination from '../components/Pagination';

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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const result = await getTeacherCourses({ page: currentPage, limit: itemsPerPage });
      if (result.status) {
        setCourses(result.data || []);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
        }
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
        endTime: ''
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
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8">

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

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

        {/* MODAL */}
        {
          showModal &&
          
          <ClassCreationModal 
          isActive={showModal} 
          onClose={() => setShowModal(false)} 
          sessionData={sessionData} 
          setSessionData={setSessionData} 
          setThumbnail={setThumbnail} 
          isSubmitting={isSubmitting} 
          handleSubmitSession={handleSubmitSession}
          allowCourseSelection={false}
          />
        }
        
      </div>
    </div>
  );
};

export default Courses;