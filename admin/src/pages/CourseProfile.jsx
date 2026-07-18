import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, BACKEND_BASE_URL } from "../services/api";
import { toast } from "react-toastify";

export default function CourseProfile() {
  const { courseCode } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseCode]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await getCourseById(courseCode);
      // console.log('Fetched course data:', response.data);
      setCourse(response.data);
    } catch (error) {
      console.error("Failed to fetch course:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Course Profile</h1>

        <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Large Image Section */}
          {course.thumbnail && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">Course Image</h3>
              <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-100">
                <img
                  src={course.thumbnail?.startsWith('http') ? course.thumbnail : `${BACKEND_BASE_URL}${course.thumbnail}`}
                  alt={course.courseName}
                  className="w-full h-32 md:h-32 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => setIsModalOpen(true)}
                />
                <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-lg font-medium opacity-0 hover:opacity-100 transition-opacity duration-300">Click to enlarge</span>
                </div>
              </div>
            </div>
          )}
          {/* Header Section */}
          <div className="mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{course.courseName}</h2>
              <p className="text-lg text-gray-500 mb-4">Code: {course.courseCode}</p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                  course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {course.status}
                </span>
                <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">{course.courseType}</span>
                <span className="text-sm text-gray-600 bg-purple-50 px-3 py-1 rounded-full">{course.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm text-gray-800">{course.courseDescription}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">MRP</label>
                  <p className="text-sm text-gray-800">{course.mrp}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Course Start Date</label>
                  <p className="text-sm text-gray-800">
                    {course.courseStartDate ? new Date(course.courseStartDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div>

                  <label className="block text-sm font-medium text-gray-600">discountedprice</label>
                  <p className="text-sm text-gray-800">${course.discountedprice}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Total Lessons</label>
                  <p className="text-sm text-gray-800">{course.totalLessons}</p>
                </div>
                <div>
                <label className="block">Course Duration for student</label>
                <p className="text-sm" >{course.courseDuration}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Total Enrollment</label>
                  <p className="text-sm text-gray-800">{course.totalenrollment || 0}</p>
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-600">Deadline of Course</label>
                  <p className="text-sm text-gray-800">
                    {course.deadline ? new Date(course.deadline).toLocaleDateString() : 'No deadline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic/Non-Academic Specific */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {course.courseType === 'academic' ? 'Academic Details' : 'Non-Academic Details'}
              </h3>
              <div className="space-y-3">
                {course.courseType === 'academic' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Board</label>
                      <p className="text-sm text-gray-800">{course.board || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Medium</label>
                      <p className="text-sm text-gray-800">{course.medium || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Class</label>
                      <p className="text-sm text-gray-800">{course.classname || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Subject</label>
                      <p className="text-sm text-gray-800">{course.subject || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Stream</label>
                      <p className="text-sm text-gray-800">{course.stream || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Category</label>
                      <p className="text-sm text-gray-800">{course.category || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Subcategory</label>
                      <p className="text-sm text-gray-800">{course.subcategory || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Target Audience</label>
                      <p className="text-sm text-gray-800">{course.targetAudience || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {new Date(course.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(course.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>

          
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && course.thumbnail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={course.thumbnail?.startsWith('http') ? course.thumbnail : `${BACKEND_BASE_URL}${course.thumbnail}`}
              alt={course.courseName}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
