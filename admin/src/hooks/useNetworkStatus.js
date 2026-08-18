import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionStatus = () => {
      if ('connection' in navigator && navigator.connection) {
        const conn = navigator.connection;
        const slowTypes = ['slow-2g', '2g'];
        setIsSlow(slowTypes.includes(conn.effectiveType) || (conn.rtt && conn.rtt > 500));
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if ('connection' in navigator && navigator.connection) {
      navigator.connection.addEventListener('change', updateConnectionStatus);
      updateConnectionStatus();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if ('connection' in navigator && navigator.connection) {
        navigator.connection.removeEventListener('change', updateConnectionStatus);
      }
    };
  }, []);

  return { isOnline, isSlow };
}

export default useNetworkStatus;
