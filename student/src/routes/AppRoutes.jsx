import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layouts
import DashboardLayout from "@/app/(dashboard)/layout";
import AuthLayout from "@/app/auth/layout";

// Main Pages
import RootPage from "@/app/page";
import CoursesPage from "@/app/courses/CoursesPage";
import CourseDetailsPage from "@/app/courses/[courseId]/page";
import CheckoutSuccessPage from "@/app/checkout-success/page";
import ForgotPasswordPage from "@/app/forgot-password/page";

// Auth Pages
import LoginPage from "@/app/auth/login/Login";
import SignupPage from "@/app/auth/signup/Signup";

// Dashboard Pages
import Dashboard from "@/app/(dashboard)/dashboard/Dashboard";
import AssignmentsPage from "@/app/(dashboard)/assignments/AssignmentsPage";
import DoubtPage from "@/app/(dashboard)/doubt/DoubtPage";
import ExplorePage from "@/app/(dashboard)/explore/[className]/[subjectName]/page";
import LivePage from "@/app/(dashboard)/live/LivePage";
import ProfilePage from "@/app/(dashboard)/profile/ProfilePage";
import ProgressPage from "@/app/(dashboard)/progress/ProgressPage";
import SettingsPage from "@/app/(dashboard)/settings/SettingsPage";
import TestsPage from "@/app/(dashboard)/tests/TestsPage";
import TestAttemptPage from "@/app/(dashboard)/tests/[testId]/TestAttemptPage";

function DashboardLayoutWrapper() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function AuthLayoutWrapper() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root Route -> Redirects to /dashboard if logged in, /auth/login if not */}
      <Route path="/" element={<RootPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayoutWrapper />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
      </Route>

      {/* Student Portal Routes */}
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
      <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Dashboard Routes */}
      <Route element={<DashboardLayoutWrapper />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/doubt" element={<DoubtPage />} />
        <Route path="/explore/:className/:subjectName" element={<ExplorePage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/tests/:testId" element={<TestAttemptPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
