import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import SuspendedStudents from './pages/Suspendedstudents';
import TerminatedStudents from './pages/TerminatedStudents';
import StudentProfile from './components/StudentProfile';
import TeacherProfile from './components/TeacherProfile';

import PendingTeacher from './pages/PendingTeacher';
import ApprovedTeacher from './pages/ApprovedTeacher';
import SuspendedTeacher from './pages/SuspendedTeachers';
import TerminatedTeacher from './pages/TerminatedTeacher';
import ApprovedParents from './pages/ApprovedParents';
import TerminatedParents from './pages/TerminatedParents';
import SuspendedParents from './pages/SuspendedParents';
import Course from './pages/Course';
import CourseProfile from './pages/CourseProfile';
import Enrollment from './pages/Enrollment';
import Invoice from './pages/Invoice';
import ManageContent from './pages/Managecontent';
import ManageContactUs from './pages/Managecontactus';
import ManageBroadcast from './pages/ManageBroadcast';
import AdminProfile from './pages/AdminProfile';
import Subscription from './pages/Subscription';
import Payout from './pages/Payout';
import Login from './pages/login';
import Classes from './pages/Classes';
import Batches from './pages/Batches';
import ProtectedRoute from './components/ProtectedRoute';
import Reports from './pages/Reports';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3b82f6' }}></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <Sidebar collapsed={collapsed} />}

      <div className={isAuthenticated ? `${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300` : ''}>
        {isAuthenticated && <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />}

        <div className={isAuthenticated ? "mt-16" : ""}>
          <Routes>

            {/* 🔓 PUBLIC ROUTE */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />

            {/* 🔐 PROTECTED ROUTES */}
            <Route path="/dashboard" element={<ProtectedRoute>< Dashboard /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/students/suspended" element={<ProtectedRoute><SuspendedStudents /></ProtectedRoute>} />
            <Route path="/students/terminated" element={<ProtectedRoute><TerminatedStudents /></ProtectedRoute>} />
            <Route path="/students/profile/:studentId" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
            <Route path="/teachers/profile/:teacherId" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />


            <Route path="/teacher/pending" element={<ProtectedRoute><PendingTeacher /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute>< ApprovedTeacher /></ProtectedRoute>} />
            <Route path="/teacher/suspended" element={<ProtectedRoute><SuspendedTeacher /></ProtectedRoute>} />
            <Route path="/teacher/terminated" element={<ProtectedRoute><TerminatedTeacher /></ProtectedRoute>} />

            <Route path="/parents" element={<ProtectedRoute>< ApprovedParents /></ProtectedRoute>} />
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
            <Route path="/batches" element={<ProtectedRoute><Batches /></ProtectedRoute>} />

            {/* 🔁 DEFAULT */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
            />

          </Routes>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}