import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import TeacherSubscriptionGate from "../components/TeacherSubscriptionGate";
import { useAuth } from "../context/AuthContext";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { NoNetworkState, SlowNetworkState, LoadingState } from "../components/states";

// Lazy-loaded Feature Components for Teacher Portal
const Login = lazy(() => import("../features/auth/login"));
const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const AdminProfile = lazy(() => import("../features/profile/AdminProfile"));
const Courses = lazy(() => import("../features/course/Courses"));
const CourseDetail = lazy(() => import("../features/course/CourseDetail"));
const Classes = lazy(() => import("../features/course/Classes"));
const Students = lazy(() => import("../features/student/Students"));
const Doubt = lazy(() => import("../features/assessment/Doubt"));
const SubmittedAssignments = lazy(() => import("../features/assessment/SubmittedAssignments"));
const Questions = lazy(() => import("../features/assessment/Question"));
const Test = lazy(() => import("../features/assessment/Test"));
const SubmittedTests = lazy(() => import("../features/assessment/submittedTests"));
const Subscription = lazy(() => import("../features/finance/Subscription"));
const CheckoutSuccess = lazy(() => import("../features/finance/CheckoutSuccess"));
const Earnings = lazy(() => import("../features/finance/Earnings"));

export default function AppRoutes() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { isAuthenticated, loading } = useAuth();
  const { isOnline, isSlow } = useNetworkStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {!isOnline && <NoNetworkState />}
      {isOnline && isSlow && <SlowNetworkState />}

      {isAuthenticated && <Sidebar collapsed={collapsed} />}

      <div className={isAuthenticated ? `${collapsed ? "ml-20" : "ml-64"} transition-all duration-300` : ""}>
        {isAuthenticated && <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />}

        <div className={isAuthenticated ? "mt-16" : ""}>
          <Suspense fallback={<LoadingState message="Loading teacher portal..." />}>
            <Routes>
              {/* Public Route */}
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
              />

              {/* Protected Routes */}
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
              <Route
                path="/subscription"
                element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout-success"
                element={
                  <ProtectedRoute>
                    <CheckoutSuccess />
                  </ProtectedRoute>
                }
              />
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

              {/* Default Fallback */}
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
