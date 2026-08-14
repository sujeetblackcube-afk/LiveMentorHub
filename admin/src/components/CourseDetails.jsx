import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSuperAdminCourseParticipants } from '../services/api';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [participants, setParticipants] = useState({ teachers: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError('');
        const response = await getSuperAdminCourseParticipants(courseId);
        const payload = response?.data || response || { teachers: [], students: [] };
        setParticipants({
          teachers: payload.teachers || [],
          students: payload.students || [],
        });
      } catch (err) {
        setParticipants({ teachers: [], students: [] });
        setError(err.message || 'Unable to load course participants.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [courseId]);

  const currentCourseName = courseId || 'Unknown Course';

  const isApprovedStatus = (status) => {
    const normalized = String(status || '').trim().toUpperCase();
    return ['APPROVED', 'ACTIVE', 'VERIFIED', 'CONFIRMED'].includes(normalized);
  };

  const visibleStudents = (participants.students || []).filter((student) => isApprovedStatus(student.status));
  const visibleTeachers = (participants.teachers || []).filter((teacher) => isApprovedStatus(teacher.status));

  const filteredStudents = visibleStudents.filter((student) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return (
      (student.name || '').toLowerCase().includes(q) ||
      (student.studentId || '').toLowerCase().includes(q) ||
      (student.email || '').toLowerCase().includes(q)
    );
  });

  const filteredTeachers = visibleTeachers.filter((teacher) => {
    if (!teacherSearch) return true;
    const q = teacherSearch.toLowerCase();
    return (
      (teacher.name || '').toLowerCase().includes(q) ||
      (teacher.email || '').toLowerCase().includes(q) ||
      (teacher.teacherId || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Course Details <span className="text-gray-400 font-normal mx-2">|</span> {currentCourseName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage students and teachers for {currentCourseName}
            </p>
          </div>

          
        </div>

        <div className="flex flex-col md:flex-row gap-8">
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

          <div className="flex-1 min-w-0">
            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
              {error && (
                <div className="p-4 border-b border-red-200 bg-red-50 text-sm text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="p-6 text-gray-500">Loading participants...</div>
              ) : activeTab === 'students' ? (
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
                          <th className="px-6 py-4 text-left font-medium">Progress</th>
                          <th className="px-6 py-4 text-left font-medium">Payment</th>
                          <th className="px-6 py-4 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                              No students found
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student) => (
                            <tr
                              key={student.studentId}
                              className="border-t hover:bg-gray-50 cursor-pointer"
                              onClick={() => navigate(`/students/profile/${student.studentId}`)}
                            >
                              <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                              <td className="px-6 py-4">
                                <div className="flex max-w-[220px] flex-col text-gray-600 break-words">
                                  <span className="break-all">{student.email || 'N/A'}</span>
                                  <span className="text-xs text-gray-500 break-all">{student.mobile || student.phone || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{student.progressPercentage}%</td>
                              <td className="px-6 py-4 text-gray-600">{student.paymentStatus || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  student.status === 'APPROVED'
                                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                    : student.status === 'SUSPENDED'
                                      ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                      : 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20'
                                }`}>
                                  {student.status || 'ACTIVE'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
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
                          <th className="px-6 py-4 text-left font-medium">Email</th>
                          <th className="px-6 py-4 text-left font-medium">Phone Number</th>
                          <th className="px-6 py-4 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                              No teachers found
                            </td>
                          </tr>
                        ) : (
                          filteredTeachers.map((teacher) => (
                            <tr
                              key={teacher.teacherId}
                              className="border-t hover:bg-gray-50 cursor-pointer"
                              onClick={() => navigate(`/teachers/profile/${teacher.teacherId}`)}
                            >
                              <td className="px-6 py-4 font-medium text-gray-900">{teacher.name}</td>
                              <td className="px-6 py-4 text-gray-600">{teacher.email || 'N/A'}</td>
                              <td className="px-6 py-4 text-gray-600">{teacher.mobile || teacher.whatsappNumber || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  teacher.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                    : 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20'
                                }`}>
                                  {teacher.status || 'ACTIVE'}
                                </span>
                              </td>
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
