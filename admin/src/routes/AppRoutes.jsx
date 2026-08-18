import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { NoNetworkState, SlowNetworkState } from '../components/states';

// Feature modules lazy imports matching EduMentorHub structure
const Login = lazy(() => import('../features/auth/Login'));
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));

// Student feature
const Students = lazy(() => import('../features/student/Students'));
const SuspendedStudents = lazy(() => import('../features/student/SuspendedStudents'));
const TerminatedStudents = lazy(() => import('../features/student/TerminatedStudents'));
const StudentProfile = lazy(() => import('../features/student/StudentProfile'));

// Teacher feature
const ApprovedTeacher = lazy(() => import('../features/teacher/ApprovedTeacher'));
const PendingTeacher = lazy(() => import('../features/teacher/PendingTeacher'));
const SuspendedTeacher = lazy(() => import('../features/teacher/SuspendedTeacher'));
const TerminatedTeacher = lazy(() => import('../features/teacher/TerminatedTeacher'));
const TeacherProfile = lazy(() => import('../features/teacher/TeacherProfile'));

// Parent feature
const ApprovedParents = lazy(() => import('../features/parent/ApprovedParents'));
const SuspendedParents = lazy(() => import('../features/parent/SuspendedParents'));
const TerminatedParents = lazy(() => import('../features/parent/TerminatedParents'));

// Course feature
const Course = lazy(() => import('../features/course/Course'));
const CourseProfile = lazy(() => import('../features/course/CourseProfile'));
const CourseInfo = lazy(() => import('../features/course/CourseInfo'));
const CourseDetails = lazy(() => import('../features/course/CourseDetails'));
const Batches = lazy(() => import('../features/course/Batches'));
const Classes = lazy(() => import('../features/course/Classes'));
const ClassDetails = lazy(() => import('../features/course/ClassDetails'));
const SubjectDetails = lazy(() => import('../features/course/SubjectDetails'));

// Enrollment & Finance feature
const Enrollment = lazy(() => import('../features/enrollment/Enrollment'));
const Invoice = lazy(() => import('../features/enrollment/Invoice'));
const Payout = lazy(() => import('../features/finance/Payout'));
const Subscription = lazy(() => import('../features/finance/Subscription'));

// Management feature
const ManageContent = lazy(() => import('../features/management/Managecontent'));
const ManageContactUs = lazy(() => import('../features/management/Managecontactus'));
const ManageBroadcast = lazy(() => import('../features/management/ManageBroadcast'));
const AdminProfile = lazy(() => import('../features/management/AdminProfile'));
const Reports = lazy(() => import('../features/management/Reports'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#3b82f6' }}></div>
  </div>
);


export function AppRoutes() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { isAuthenticated } = useAuth();
  const { isOnline, isSlow } = useNetworkStatus();

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isAuthenticated && <Sidebar collapsed={collapsed} />}

      <div className={isAuthenticated ? `${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300` : ''}>
        {isAuthenticated && <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />}

        <div className={isAuthenticated ? "mt-16 p-2" : ""}>
          {!isOnline && (
            <div className="mb-4">
              <NoNetworkState />
            </div>
          )}
          {isOnline && isSlow && (
            <div className="mb-4">
              <SlowNetworkState />
            </div>
          )}

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* 🔓 PUBLIC ROUTE */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                }
              />

              {/* 🔐 PROTECTED ROUTES */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
              <Route path="/students/suspended" element={<ProtectedRoute><SuspendedStudents /></ProtectedRoute>} />
              <Route path="/students/terminated" element={<ProtectedRoute><TerminatedStudents /></ProtectedRoute>} />
              <Route path="/students/profile/:studentId" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
              <Route path="/teachers/profile/:teacherId" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />

              <Route path="/teacher/pending" element={<ProtectedRoute><PendingTeacher /></ProtectedRoute>} />
              <Route path="/teacher" element={<ProtectedRoute><ApprovedTeacher /></ProtectedRoute>} />
              <Route path="/teacher/suspended" element={<ProtectedRoute><SuspendedTeacher /></ProtectedRoute>} />
              <Route path="/teacher/terminated" element={<ProtectedRoute><TerminatedTeacher /></ProtectedRoute>} />

              <Route path="/parents" element={<ProtectedRoute><ApprovedParents /></ProtectedRoute>} />
              <Route path="/parents/suspended" element={<ProtectedRoute><SuspendedParents /></ProtectedRoute>} />
              <Route path="/parents/terminated" element={<ProtectedRoute><TerminatedParents /></ProtectedRoute>} />

              <Route path="/course" element={<ProtectedRoute><Course status="Active" /></ProtectedRoute>} />
              <Route path="/course/inactive" element={<ProtectedRoute><Course status="Inactive" /></ProtectedRoute>} />
              <Route path="/course/profile/:courseCode" element={<ProtectedRoute><CourseProfile /></ProtectedRoute>} />

              <Route path="/enrollment" element={<ProtectedRoute><Enrollment /></ProtectedRoute>} />
              <Route path="/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
              <Route path="/managecontent" element={<ProtectedRoute><ManageContent /></ProtectedRoute>} />
              <Route path="/managecontactus" element={<ProtectedRoute><ManageContactUs /></ProtectedRoute>} />
              <Route path="/managebroadcast" element={<ProtectedRoute><ManageBroadcast /></ProtectedRoute>} />
              <Route path="/adminprofile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/payout" element={<ProtectedRoute><Payout /></ProtectedRoute>} />
              
              <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
              <Route path="/classes/:classId" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
              <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
              <Route path="/subjects/:subjectId" element={<ProtectedRoute><SubjectDetails /></ProtectedRoute>} />
              <Route path="/course_info/:courseCode" element={<ProtectedRoute><CourseInfo /></ProtectedRoute>} />
              <Route path="/batches" element={<ProtectedRoute><Batches /></ProtectedRoute>} />

              {/* 🔁 DEFAULT */}
              <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
              />
            </Routes>
          </Suspense>
        </div>
      </div>
    </>
  );
}

export default AppRoutes;
