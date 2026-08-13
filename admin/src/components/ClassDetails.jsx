import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// 1. DUMMY DATA FOR CLASS
const CLASSES_DUMMY_DATA = [
  { classId: 'cls-9', classLevel: 'Class 9' },
  { classId: 'cls-10', classLevel: 'Class 10' },
  { classId: 'cls-11', classLevel: 'Class 11' },
  { classId: 'cls-12', classLevel: 'Class 12' },
];

// 2. DUMMY DATA FOR TABS
const SUBJECTS_DUMMY_DATA = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'Science' },
  { id: 3, name: 'English Literature' },
  { id: 4, name: 'History' },
  { id: 5, name: 'Computer Science' },
];

const COURSES_DUMMY_DATA = [
  { id: 'crs-1', title: 'Algebra Foundations', subjectName: 'Mathematics', students: 45 },
  { id: 'crs-2', title: 'Physics 101: Mechanics', subjectName: 'Science', students: 32 },
  { id: 'crs-3', title: 'Creative Writing Workshop', subjectName: 'English Literature', students: 28 },
];

export default function ClassDetails() {
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'courses'
  const [courseSearch, setCourseSearch] = useState('');
  const navigate = useNavigate();

  // Find the class details or fallback to a default if not found
  const currentClass = CLASSES_DUMMY_DATA.find((c) => c.classId === classId) || { classLevel: 'Class 8th' };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Class Details <span className="text-gray-400 font-normal mx-2">|</span> {currentClass.classLevel}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage subjects and courses for {currentClass.classLevel} (ID: {classId})
            </p>
          </div>

          {/* Action Buttons - Dynamically Displayed */}
          <div className="flex space-x-3">
            {activeTab === 'subjects' && (
              <button
                onClick={() => console.log('Open Add Subject Modal')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                + Add Subject
              </button>
            )}
            
            {activeTab === 'courses' && (
              <button
                onClick={() => console.log('Open Add Course Modal')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                + Add Course
              </button>
            )}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar (Tabs) */}
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

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
              
              {/* Conditional Rendering based on Active Tab */}
              {activeTab === 'subjects' && (
                <div className="p-6 bg-gray-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SUBJECTS_DUMMY_DATA.map((subject) => (
                      <div 
                        key={subject.id} 
                        onClick={() => navigate(`/subjects/${subject.id}`)}
                        className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex items-center space-x-4 hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg">
                          {subject.name.charAt(0)}
                        </div>
                        <span className="text-gray-800 font-medium truncate">
                          {subject.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
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
                        {COURSES_DUMMY_DATA.filter((c) => {
                          if (!courseSearch) return true;
                          const q = courseSearch.toLowerCase();
                          return (
                            c.title.toLowerCase().includes(q) ||
                            c.subjectName.toLowerCase().includes(q) ||
                            c.id.toLowerCase().includes(q)
                          );
                        }).map((course) => (
                          <tr
                            key={course.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                            onClick={() => navigate(`/courses/${course.id}`)}
                          >
                            <td className="px-6 py-4 font-medium">
                              <div className="text-gray-900">{course.title}</div>
                              <div className="text-xs text-gray-500">{course.id}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{course.subjectName}</td>
                            <td className="px-6 py-4 text-gray-600">{course.students}</td>
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