"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";
import { toast } from "react-toastify";

export function AuthListener() {
  const logout = useAuth((state) => state.logout);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          const message = data?.message || "";
          if (
            message.includes("Session expired") ||
            message.includes("logged in from another device") ||
            message.includes("Unauthorized") ||
            message.includes("Invalid token")
          ) {
            if (useAuth.getState().isAuthenticated) {
              logout();
              toast.error(
                "Session expired or logged in from another device. Please log in again."
              );
              window.location.href = "/student/auth/login";
            }
          }
        } catch {
          if (useAuth.getState().isAuthenticated) {
            logout();
            toast.error("Session expired. Please log in again.");
            window.location.href = "/student/auth/login";
          }
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [logout]);

  return null;
}
