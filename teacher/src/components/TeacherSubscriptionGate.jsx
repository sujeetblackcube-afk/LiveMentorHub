import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getSubscriptionsByTeacherId } from "../services/api";

export default function TeacherSubscriptionGate({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  const [checking, setChecking] = useState(true);
  const [hasActive, setHasActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSubscription = async () => {
      if (!isAuthenticated || loading) return;

      try {
        if (!user?.teacherId) {
          if (!cancelled) {
            setHasActive(false);
            setChecking(false);
          }
          return;
        }

        const resp = await getSubscriptionsByTeacherId(user.teacherId);

        const list = resp?.data || [];

        const active = list.some(
          (item) =>
            item?.status?.toLowerCase() === "active"
        );

        if (!cancelled) {
          setHasActive(active);
        }
      } catch (err) {
        console.error("Subscription check failed:", err);

        if (!cancelled) {
          setHasActive(false);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [user, isAuthenticated, loading]);

  // Loading
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Allow pages if active
  if (hasActive) {
    return children;
  }

  // Redirect to subscription page
  return (
    <Navigate
      to="/subscription"
      replace
      state={{
        message:
          "Please buy subscription to access dashboard and pages.",
      }}
    />
  );
}