import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GraduationCap, Search, Mail, Phone, MapPin, User, Users,Book,BookOpen } from 'lucide-react';
import { theme } from '../theme';
import { getTeacherCourseStudents } from '../services/api';
import Pagination from '../components/Pagination';

const Students = () => {
  const { courseCode } = useParams();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', studentId: '' });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, [courseCode]);

  useEffect(() => {
    const filtered = students.filter(student => {
      const nameMatch = filters.name === '' || 
        (student.studentName && student.studentName.toLowerCase().includes(filters.name.toLowerCase()));
      const studentIdMatch = filters.studentId === '' || 
        (student.studentId && student.studentId.toLowerCase().includes(filters.studentId.toLowerCase()));
      return nameMatch && studentIdMatch;
    });
    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [students, filters]);

  const fetchStudents = async () => {
    try {
      if (courseCode) {
        // Fetch students for specific course
        const response = await getTeacherCourseStudents(courseCode);
        if (response.success) {
          setStudents(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch students');
        }
      } else {
        // Fetch all students from all courses
        const token = localStorage.getItem('token');
        const coursesResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/teachers/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (coursesResponse.ok) {
          const coursesResult = await coursesResponse.json();
          if (coursesResult.status) {
            const allEnrollments = [];

            for (const course of coursesResult.data) {
              const studentsResponse = await getTeacherCourseStudents(course.courseCode);
              if (studentsResponse.success) {
                // Add all enrollments without deduplication to show course information
                allEnrollments.push(...studentsResponse.data);
              }
            }
            setStudents(allEnrollments);
          } else {
            toast.error('Failed to fetch courses');
          }
        } else {
          toast.error('Failed to fetch courses');
        }
      }
    } catch (error) {
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const displayStudents = filteredStudents.length > 0 ? filteredStudents : students;
  const totalPages = Math.ceil(displayStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = displayStudents.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 p-4" style={{ background: theme.colors.secondary }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
          <div className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.colors.secondary }}
    >
      {/* PAGE CONTAINER */}
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            Students {courseCode && `for Course ${courseCode}`}
          </h1>
          <p
            className="text-lg"
            style={{ color: theme.colors.textSecondary }}
          >
            {courseCode ? 'Enrolled students in this course' : 'All enrolled students from your courses'}
          </p>
        </div>

        {/* FILTERS */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
              <input
                type="text"
                placeholder="Filter by Name"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300"
                style={{
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  boxShadow: `0 4px 6px ${theme.colors.shadow}`
                }}
                onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                onBlur={(e) => e.target.style.borderColor = theme.colors.border}
              />
            </div>
            <div className="relative">
              <GraduationCap size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
              <input
                type="text"
              placeholder="Filter by StudentID"
                value={filters.studentId}
                onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300"
                style={{
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  boxShadow: `0 4px 6px ${theme.colors.shadow}`
                }}
                onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                onBlur={(e) => e.target.style.borderColor = theme.colors.border}
              />
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-6">
              <Users size={80} style={{ color: theme.colors.primary }} />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full" style={{ background: theme.colors.primary }}></div>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
              {courseCode ? 'No students enrolled' : 'No students found'}
            </h2>
            <p
              className="text-lg"
              style={{ color: theme.colors.textSecondary }}
            >
              {courseCode ? 'This course has no enrolled students yet.' : 'No students are enrolled in your courses.'}
            </p>
          </div>
        ) : (
          <>
            {/* STUDENTS TABLE */}
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <table
                  className="min-w-full border-collapse border-2 rounded-2xl overflow-hidden"
                  style={{
                    background: theme.colors.card,
                    borderColor: theme.colors.primary,
                    boxShadow: `0 8px 32px ${theme.colors.shadow}`
                  }}
                >
                  <thead className="sticky top-0">
                    <tr style={{ background: theme.colors.primary }}>
                      <th
                        className="px-6 py-4 text-left font-bold text-white border-r"
                        style={{ borderColor: theme.colors.primary }}
                      >
                        S.No
                      </th>
                      <th
                        className="px-6 py-4 text-left font-bold text-white border-r"
                        style={{ borderColor: theme.colors.primary }}
                      >
                        <div className="flex items-center">
                          <User size={20} className="mr-2" />
                          Name
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left font-bold text-white border-r"
                        style={{ borderColor: theme.colors.primary }}
                      >
                        <div className="flex items-center">
                          <GraduationCap size={20} className="mr-2" />
                          Student ID
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left font-bold text-white border-r"
                        style={{ borderColor: theme.colors.primary }}
                      >
                        <div className="flex items-center">
                          <BookOpen size={20} className="mr-2" />
                          Course Code
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left font-bold text-white border-r"
                        style={{ borderColor: theme.colors.primary }}
                      >
                        <div className="flex items-center">
                          <Book size={20} className="mr-2" />
                          Course Name
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student, index) => (
                      <tr
                        key={startIndex + index}
                        className="hover:scale-[1.02] transition-all duration-300"
                        style={{
                          backgroundColor: index % 2 === 0 ? theme.colors.card : theme.colors.cardHover,
                          borderBottom: `1px solid ${theme.colors.border}`
                        }}
                      >
                        <td
                          className="px-6 py-4 font-semibold border-r text-center"
                          style={{
                            color: theme.colors.textPrimary,
                            borderColor: theme.colors.border
                          }}
                        >
                          {startIndex + index + 1}
                        </td>
                        <td
                          className="px-6 py-4 font-semibold border-r"
                          style={{
                            color: theme.colors.textPrimary,
                            borderColor: theme.colors.border
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: theme.colors.primary }}>
                              <User size={16} color="white" />
                            </div>
                            {student.studentName}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 font-medium border-r"
                          style={{
                            color: theme.colors.textPrimary,
                            borderColor: theme.colors.border
                          }}
                        >
                          <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: theme.colors.highlight, color: theme.colors.textPrimary }}>
                            {student.studentId}
                          </span>
                        </td>
                       
                        <td
                          className="px-6 py-4 border-r"
                          style={{
                            color: theme.colors.textSecondary,
                            borderColor: theme.colors.border
                          }}
                        >
                          <div className="flex items-center">
                            <BookOpen size={16} style={{ color: theme.colors.info, marginRight: '6px' }} />
                            {student.courseCode}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 border-r"
                          style={{
                            color: theme.colors.textSecondary,
                            borderColor: theme.colors.border
                          }}
                        >
                          <div className="flex items-center">
                            <Book size={16} style={{ color: theme.colors.warning, marginRight: '6px' }} />
                            {student.courseName}
                          </div>
                        </td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Students;
