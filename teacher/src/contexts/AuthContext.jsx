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

      // ✅ Token exists (frontend-only mode)
      setIsAuthenticated(true);

      // Restore user safely (prevents dashboard auto redirect bugs)
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
    // 🔐 Store all auth data (IMPORTANT)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);

    setIsAuthenticated(true);
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    // 🧹 Clear everything to stop auto dashboard access
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    setIsAuthenticated(false);
    setUser(null);
    setRole(null);

    // Force redirect
    window.location.href = "/teacher/login";
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