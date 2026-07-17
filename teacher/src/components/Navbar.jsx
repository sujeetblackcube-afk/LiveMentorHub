import React, { useState, useRef, useEffect } from "react";
import { Search, MessageSquare, Bell, ChevronDown, Menu, LogOut, User, X, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { theme } from "../theme.js";
import { getNotificationByTeacherId, deleteAllNotificationByTeacher, deleteNotification } from '../services/api';

export default function Navbar({ collapsed, setCollapsed }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const { logout, user, role } = useAuth();
  const [profileImage, setProfileImage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'teacher') {
      fetchProfile();
    }
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/teachers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.profileImage ? (data.profileImage.startsWith('http') ? data.profileImage : `${import.meta.env.VITE_BACKEND_BASE_URL}/${data.profileImage}`) : '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await getNotificationByTeacherId();
      if (response.success) {
        setNotifications(response.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    if (!notificationOpen) {
      fetchNotifications();
    }
    setNotificationOpen(!notificationOpen);
    setDropdownOpen(false);
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.notificationId !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationItemClick = (notification) => {
    setNotificationOpen(false);
    
    // Check type first
    const type = (notification.type || "").toLowerCase();
    if (type === "student") return navigate("/students");
    if (type === "course") return navigate("/courses");
    if (type === "assignment") return navigate("/submitted-assignments");
    if (type === "payment" || type === "subscription") return navigate("/subscription");
    
    // Fallback to title/message matching
    const title = (notification.title || "").toLowerCase();
    const message = (notification.message || notification.content || "").toLowerCase();
    const text = title + " " + message;
    
    if (text.includes("student")) return navigate("/students");
    if (text.includes("course")) return navigate("/courses");
    if (text.includes("live") || text.includes("class")) return navigate("/classes");
    if (text.includes("test") || text.includes("exam")) return navigate("/tests");
    if (text.includes("assignment")) return navigate("/submitted-assignments");
    if (text.includes("pay") || text.includes("subscrip")) return navigate("/subscription");
    if (text.includes("doubt") || text.includes("question")) return navigate("/doubt");
    if (text.includes("earn")) return navigate("/earnings");
    
    navigate("/dashboard");
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotificationByTeacher();
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/teacher/login');
  };

  return (
    <header className={`fixed top-0 ${collapsed ? 'left-16 sm:left-20' : 'left-48 sm:left-64'} right-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300`} style={{ backgroundColor: theme.colors.card, borderBottom: `1px solid ${theme.colors.border}` }}>
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Menu Icon */}
        <Menu
          className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"
          style={{ color: theme.colors.textSecondary }}
          onClick={() => setCollapsed(!collapsed)}
        />

        {/* Logo */}
        
        <div
          className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-bold"
          style={{ color: theme.colors.primary }}
        >
          <div className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg overflow-hidden">
            <img
              src="/teacher/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <span className="hidden sm:inline">{theme.logo.text}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-6 relative">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Bell 
            className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" 
            style={{ color: theme.colors.textSecondary }}
            onClick={handleNotificationClick}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
          
          {/* Notification Dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-lg shadow-lg z-30 overflow-hidden" style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: theme.colors.primary }}>
                <h3 className="text-white font-semibold">Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={handleDeleteAllNotifications}
                    className="text-white hover:text-red-200 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete All
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="p-4 text-center" style={{ color: theme.colors.textSecondary }}>
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center" style={{ color: theme.colors.textSecondary }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div 
                      key={notification.notificationId || index}
                      onClick={() => handleNotificationItemClick(notification)}
                      className="relative px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      style={{ borderColor: theme.colors.border }}
                    >
                      <div className="pr-8">
                        <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                          {notification.title || 'Notification'}
                        </p>
                        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                          {notification.message || notification.content || 'No message'}
                        </p>
                        {notification.createdAt && (
                          <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(notification.notificationId, e)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full text-white flex items-center justify-center font-semibold text-sm sm:text-base" style={{ backgroundColor: theme.colors.primary }}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="text-lg sm:text-2xl font-bold" style={{ color: theme.colors.textSecondary }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>

            <div className="leading-tight hidden sm:block">
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Live Mentor Hub Teacher</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{user?.name || 'Teacher'}</span>
                <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
              </div>
            </div>
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 rounded-md shadow-lg z-20" style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
              {role === 'teacher' && (
                <button
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:opacity-80"
                  style={{ color: theme.colors.textPrimary }}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:opacity-80"
                style={{ color: theme.colors.textPrimary }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
