import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthListener } from "@/components/AuthListener";
import { AuthModal } from "@/components/auth/AuthModal";
import { ToastProvider } from "@/components/ToastProvider";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthListener />
      <AppRoutes />
      <AuthModal />
      <ToastProvider />
    </ErrorBoundary>
  );
}
