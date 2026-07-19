import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate ,useNavigate} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AdminProfile from './pages/AdminProfile';
import Courses from './pages/Courses';
import Students from './pages/Students';
import Login from './pages/login';

import CourseDetail from './pages/CourseDetail';
import ProtectedRoute from './components/ProtectedRoute';
import TeacherSubscriptionGate from './components/TeacherSubscriptionGate';

import Doubt from './pages/Doubt';
import SubmittedAssignments from './pages/SubmittedAssignments';
import SubmittedTests from './pages/submittedTests';
import Questions from './pages/Question';
import Test from './pages/Test';
import Classes from './pages/Classes';
import Subscription from './pages/Subscription';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Earnings from './pages/Earnings';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <Dashboard />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <AdminProfile />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <Courses />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:courseCode?"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <Students />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/course-detail/:courseCode"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <CourseDetail />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doubts"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <Doubt />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/submitted-assignments"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <SubmittedAssignments />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <Questions />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tests"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <Test />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/submitted-tests"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <SubmittedTests />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <Classes />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/checkout-success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
            <Route
              path="/earning"
              element={
                <ProtectedRoute>
                  <TeacherSubscriptionGate>
                    <Earnings />
                  </TeacherSubscriptionGate>
                </ProtectedRoute>
              }
            />


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
