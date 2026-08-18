import { useState, useEffect } from "react";

export default function useNetworkStatus() {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSlow: false,
  });

  useEffect(() => {
    const handleOnline = () => setStatus((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      const updateConnection = () => {
        const slow = connection.effectiveType === "2g" || connection.effectiveType === "slow-2g" || connection.rtt > 500;
        setStatus((prev) => ({ ...prev, isSlow: slow }));
      };
      updateConnection();
      connection.addEventListener("change", updateConnection);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        connection.removeEventListener("change", updateConnection);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return status;
}
