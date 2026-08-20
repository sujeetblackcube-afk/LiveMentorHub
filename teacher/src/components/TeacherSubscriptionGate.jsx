import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSubscriptionsByTeacherId } from "../services/api";

// Global in-memory cache to prevent repeated API calls across page changes
const subCache = {
  teacherId: null,
  hasActive: false,
  timestamp: 0,
};

export function clearSubscriptionCache() {
  subCache.teacherId = null;
  subCache.hasActive = false;
  subCache.timestamp = 0;
  try {
    sessionStorage.removeItem("sub_gate_cache");
  } catch (e) {}
}

export default function TeacherSubscriptionGate({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  const [checking, setChecking] = useState(true);
  const [hasActive, setHasActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSubscription = async () => {
      if (!isAuthenticated || loading) return;

      const currentTeacherId = user?.teacherId;

      if (!currentTeacherId) {
        if (!cancelled) {
          setHasActive(false);
          setChecking(false);
        }
        return;
      }

      // Check 5-minute memory cache
      const now = Date.now();
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

      if (
        subCache.teacherId === currentTeacherId &&
        now - subCache.timestamp < CACHE_TTL
      ) {
        if (!cancelled) {
          setHasActive(subCache.hasActive);
          setChecking(false);
        }
        return;
      }

      // Check sessionStorage cache
      try {
        const stored = sessionStorage.getItem("sub_gate_cache");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (
            parsed.teacherId === currentTeacherId &&
            now - parsed.timestamp < CACHE_TTL
          ) {
            subCache.teacherId = parsed.teacherId;
            subCache.hasActive = parsed.hasActive;
            subCache.timestamp = parsed.timestamp;
            if (!cancelled) {
              setHasActive(parsed.hasActive);
              setChecking(false);
            }
            return;
          }
        }
      } catch (e) {}

      // If no valid cache, make exactly 1 API call
      try {
        const resp = await getSubscriptionsByTeacherId(currentTeacherId);
        const list = resp?.data || [];
        const active = list.some(
          (item) => item?.status?.toLowerCase() === "active"
        );

        subCache.teacherId = currentTeacherId;
        subCache.hasActive = active;
        subCache.timestamp = Date.now();

        try {
          sessionStorage.setItem("sub_gate_cache", JSON.stringify(subCache));
        } catch (e) {}

        if (!cancelled) {
          setHasActive(active);
        }
      } catch (err) {
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
  }, [user?.teacherId, isAuthenticated, loading]);

  // Loading spinner
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
        message: "Please buy subscription to access dashboard and pages.",
      }}
    />
  );
}