import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 1. DUMMY DATA FOR COURSE HEADER
const COURSES_DUMMY_DATA = [
  { courseId: 'crs-1', title: 'Algebra Foundations' },
  { courseId: 'crs-2', title: 'Physics 101: Mechanics' },
  { courseId: 'crs-3', title: 'Creative Writing Workshop' },
];

// 2. DUMMY DATA FOR STUDENTS
const STUDENTS_DUMMY_DATA = [
  { 
    studentId: 'STU-1001', 
    name: 'Alice Smith', 
    email: 'alice.smith@example.com', 
    mobile: '+1 234-567-8901',
    parentEmail: 'parents.alice@example.com',
    parentMobile: '+1 234-567-8900',
    board: 'CBSE',
    classGrade: 'Class 10',
    status: 'APPROVED' 
  },
  { 
    studentId: 'STU-1002', 
    name: 'Michael Johnson', 
    email: 'mjohnson99@example.com', 
    mobile: '+1 234-567-8902',
    parentEmail: 'sarah.j@example.com',
    parentMobile: '+1 234-567-8999',
    board: 'CBSE',
    classGrade: 'Class 10',
    status: 'APPROVED' 
  },
  { 
    studentId: 'STU-1003', 
    name: 'Sophia Williams', 
    email: 'sophia.w@example.com', 
    mobile: '+1 234-567-8903',
    parentEmail: 'robert.w@example.com',
    parentMobile: '+1 234-567-8998',
    board: 'ICSE',
    classGrade: 'Class 10',
    status: 'SUSPENDED' 
  },
];

// 3. DUMMY DATA FOR TEACHERS 
const TEACHERS_DUMMY_DATA = [
  { 
    teacherId: 'TCH-201', 
    name: 'Sarah Jenkins', 
    email: 's.jenkins@school.edu', 
    mobile: '+1 987-654-3210',
    qualification: 'M.Sc. Mathematics', 
    specializations: ['Algebra', 'Calculus', 'Geometry']
  },
  { 
    teacherId: 'TCH-202', 
    name: 'Dr. Robert Chen', 
    email: 'rchen@school.edu', 
    mobile: '+1 987-654-3211',
    qualification: 'Ph.D. Physics', 
    specializations: ['Mechanics', 'Thermodynamics']
  },
  { 
    teacherId: 'TCH-205', 
    name: 'David Miller', 
    email: 'dmiller@school.edu', 
    mobile: '+1 987-654-3212',
    qualification: 'B.Ed. Science', 
    specializations: ['General Science', 'Biology']
  },
];

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'teachers'
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Find the course details or fallback to a default if not found
  const currentCourse = COURSES_DUMMY_DATA.find((c) => c.courseId === courseId) || { title: 'Unknown Course' };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Course Details <span className="text-gray-400 font-normal mx-2">|</span> {currentCourse.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage students and teachers for {currentCourse.title} (ID: {courseId})
            </p>
          </div>

          {/* Action Buttons - Dynamically Displayed based on Tab */}
          <div className="flex space-x-3">
            {activeTab === 'students' && (
              <button
                onClick={() => console.log('Open Add Student Modal')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                + Add Student
              </button>
            )}
            
            {activeTab === 'teachers' && (
              <button
                onClick={() => console.log('Open Add Teacher Modal')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                + Add Teacher
              </button>
            )}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar (Tabs) */}
          <div className="w-full md:w-48 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab('students')}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'students'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Students
              </button>
              
              <button
                onClick={() => setActiveTab('teachers')}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'teachers'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Teachers
              </button>
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
              
              {/* Conditional Rendering: STUDENTS TAB */}
              {activeTab === 'students' && (
                <div className="bg-white rounded-lg border">
                  <div className="p-3 sm:p-4 rounded-lg mb-4">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search students..."
                      className="w-full max-w-xs pl-3 pr-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="overflow-x-auto h-[60vh] overflow-y-auto relative">
                    <table className="w-full text-sm table-fixed">
                      <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                        <tr className="whitespace-nowrap">
                          <th className="px-6 py-4 text-left font-medium">Name</th>
                          <th className="px-6 py-4 text-left font-medium">Student Contact</th>
                          <th className="px-6 py-4 text-left font-medium">Parent Contact</th>
                          <th className="px-6 py-4 text-left font-medium">Academics</th>
                          <th className="px-6 py-4 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {STUDENTS_DUMMY_DATA.filter((student) => {
                          if (!studentSearch) return true;
                          const q = studentSearch.toLowerCase();
                          return (
                            student.name.toLowerCase().includes(q) ||
                            student.studentId.toLowerCase().includes(q) ||
                            student.email.toLowerCase().includes(q)
                          );
                        }).map((student) => (
                          <tr key={student.studentId} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/students/profile/${student.studentId}`)}>
                            <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col text-gray-600">
                                <span>{student.email}</span>
                                <span className="text-xs text-gray-500">{student.mobile}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col text-gray-600">
                                <span>{student.parentEmail}</span>
                                <span className="text-xs text-gray-500">{student.parentMobile}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col text-gray-600">
                                <span>{student.classGrade}</span>
                                <span className="text-xs text-gray-500">{student.board}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                student.status === 'APPROVED' 
                                  ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' 
                                  : student.status === 'SUSPENDED'
                                  ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                  : 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20'
                              }`}>{student.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conditional Rendering: TEACHERS TAB */}
              {activeTab === 'teachers' && (
                <div className="bg-white rounded-lg border">
                  <div className="p-3 sm:p-4 rounded-lg mb-4">
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      placeholder="Search teachers..."
                      className="w-full max-w-xs pl-3 pr-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="overflow-x-auto h-[60vh] overflow-y-auto relative">
                    <table className="w-full text-sm table-fixed">
                      <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                        <tr className="whitespace-nowrap">
                          <th className="px-6 py-4 text-left font-medium">Name</th>
                          <th className="px-6 py-4 text-left font-medium">Contact</th>
                          <th className="px-6 py-4 text-left font-medium">Qualification</th>
                          <th className="px-6 py-4 text-left font-medium">Specializations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TEACHERS_DUMMY_DATA.filter((teacher) => {
                          if (!teacherSearch) return true;
                          const q = teacherSearch.toLowerCase();
                          return (
                            teacher.name.toLowerCase().includes(q) ||
                            teacher.email.toLowerCase().includes(q) ||
                            teacher.teacherId.toLowerCase().includes(q)
                          );
                        }).map((teacher) => (
                          <tr key={teacher.teacherId} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/teachers/profile/${teacher.teacherId}`)}>
                            <td className="px-6 py-4 font-medium text-gray-900">{teacher.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col text-gray-600">
                                <span>{teacher.email}</span>
                                <span className="text-xs text-gray-500">{teacher.mobile}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{teacher.qualification}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {teacher.specializations.map((spec, index) => (
                                  <span key={index} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap">{spec}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
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
