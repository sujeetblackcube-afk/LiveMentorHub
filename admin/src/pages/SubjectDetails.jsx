import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// DUMMY SUBJECTS MAPPING 
// To easily get the subject name from the subjectId parameter
const DUMMY_SUBJECTS = {
  '1': 'Mathematics',
  '2': 'Science',
  '3': 'English Literature',
  '4': 'History',
  '5': 'Computer Science',
};

// DUMMY DATA matching the Course model
// Added 'subjectId' to simulate filtering a single course per subject
const DUMMY_COURSES = [
  {
    id: 101,
    subjectId: '1', // Matches Mathematics
    courseCode: 'MATH-101',
    courseName: 'Algebra Foundations',
    courseType: 'academic',
    rating: 4.5,
    courseDescription: 'Master the basics of algebra including linear equations, inequalities, and functions. Perfect for beginners looking to build a strong mathematical foundation.',
    thumbnail: 'https://images.unsplash.com/photo-1632516643720-e7f5d5d6d98c?w=500&q=80',
    difficulty: 'Beginner',
    mrp: 1500.00,
    discountedprice: 999.00,
    totalenrollment: 1250,
    courseDuration: 30, // in days
    subject: 'Mathematics',
  },
  {
    id: 102,
    subjectId: '2', // Matches Science
    courseCode: 'SCI-201',
    courseName: 'Physics 101: Mechanics',
    courseType: 'academic',
    rating: 4.8,
    courseDescription: 'Dive deep into kinematics, Newton\'s laws, and energy. This course is designed for students preparing for competitive exams.',
    thumbnail: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=500&q=80',
    difficulty: 'Advanced',
    mrp: 2500.00,
    discountedprice: 1999.00,
    totalenrollment: 840,
    courseDuration: 60,
    subject: 'Science',
  },
  {
    id: 103,
    subjectId: '3', // Matches English Literature
    courseCode: 'ENG-105',
    courseName: 'Creative Writing Workshop',
    courseType: 'academic',
    rating: 4.2,
    courseDescription: 'Explore the elements of storytelling, character development, and narrative structure.',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80',
    difficulty: 'Intermediate',
    mrp: 1800.00,
    discountedprice: 1200.00,
    totalenrollment: 560,
    courseDuration: 45,
    subject: 'English Literature',
  }
];

export default function SubjectDetails() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  
  const subjectName = DUMMY_SUBJECTS[subjectId] || 'Unknown Subject';

  // Simulate an API fetch filtering by subjectId
  useEffect(() => {
    // In the future: fetch(`/api/subjects/${subjectId}/courses`).then(...)
    const filteredCourses = DUMMY_COURSES.filter(c => c.subjectId === subjectId);
    setCourses(filteredCourses);
  }, [subjectId]);

  // Helper function to color-code difficulty
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
        
        {/* Header Section */}
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
            onClick={() => console.log('Open Create Course Modal')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            + Add New Course
          </button>
        </div>

        {/* Courses Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Assigned Course</h2>
          <p className="text-sm text-gray-500 mt-1">Select the course to view or edit its details.</p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/course_info/${course.courseCode}`)}
              className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md hover:ring-blue-300 transition-all duration-200 cursor-pointer flex flex-col"
            >
              {/* Course Thumbnail */}
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

              {/* Course Info */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={course.courseName}>
                    {course.courseName}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    ★ {course.rating.toFixed(1)}
                  </span>
                  <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {course.courseDuration} Days
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                  {course.courseDescription}
                </p>

                {/* Footer of the Card: Pricing & Enrollments */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-lg font-bold text-gray-900">₹{course.discountedprice}</span>
                    {course.mrp > course.discountedprice && (
                      <span className="text-xs text-gray-400 line-through ml-2">₹{course.mrp}</span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    {course.totalenrollment.toLocaleString()} students
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg ring-1 ring-gray-200">
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new course for {subjectName}.</p>
          </div>
        )}

      </div>
    </div>
  );
}
