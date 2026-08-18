import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedRole = localStorage.getItem('role');

      // 🚫 No token OR invalid token → force login
      if (!token || token === "null" || token === "undefined" || token.length < 10) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');

        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // Check if JWT token has expired
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');

            setIsAuthenticated(false);
            setUser(null);
            setRole(null);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // Invalid token format
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');

        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // ✅ Token exists
      setIsAuthenticated(true);

      // Restore user safely
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      // Restore role
      if (savedRole) {
        setRole(savedRole);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token, userData, userRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);

    setIsAuthenticated(true);
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    setIsAuthenticated(false);
    setUser(null);
    setRole(null);

    window.location.href = "/admin/login";
  };

  const value = {
    isAuthenticated,
    user,
    role,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
