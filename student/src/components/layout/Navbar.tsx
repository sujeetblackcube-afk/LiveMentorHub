"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Menu,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  Code,
  Trash,
} from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/store/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { API_BASE, API_AUTH_BASE, NOTIFICATION_PATHS, GETPROFILE } from "@/lib/api";


export function Navbar() {
  const { isAuthenticated, user, logout, updateUser } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const STUDENT_ID = user?.studentId;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const studentId = user?.studentId || (typeof window !== "undefined" ? localStorage.getItem("studentId") : null);
        if (!studentId) return;

        const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_AUTH_BASE}${GETPROFILE.getprofile(studentId)}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            updateUser({
              name: json.data.name,
              email: json.data.email,
              studentId: json.data.studentId,
              country: json.data.country,
              profileImage: json.data.profileImage,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching student profile for navbar:", err);
      }
    };

    if (isAuthenticated) {
      fetchStudentProfile();
    }

    const handleProfileUpdate = () => fetchStudentProfile();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [isAuthenticated, user?.studentId]);

  useEffect(() => {
    if (isAuthenticated && isNotifOpen) fetchNotifications();
  }, [isNotifOpen]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    window.location.href = "/student/auth/login";
  };

  const fetchNotifications = async () => {
    try {
      const studentId = user?.studentId;
      if (!studentId) return;
      const res = await fetch(
        `${API_BASE}${NOTIFICATION_PATHS.getNotifications(studentId)}`,
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!notificationId) return;
    try {
      await fetch(
        `${API_BASE}${NOTIFICATION_PATHS.deleteNotification(notificationId)}`,
        { method: "DELETE" },
      );
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId),
      );
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch(
        `${API_BASE}${NOTIFICATION_PATHS.clearAllNotifications(STUDENT_ID!)}`,
        { method: "DELETE" },
      );
      setNotifications([]);
    } catch (err) {
      console.error("Clear all notifications error:", err);
    }
  };

  const AUTH_NAV_LINKS = [
    { label: "Home", href: "/student/dashboard" },
    { label: "Courses", href: "/student/courses" },
    { label: "Live", href: "/student/live" },
    { label: "Doubt", href: "/student/doubt" },
  ];

  const GUEST_NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "Course", href: "/student/courses?demo=true" },
  ];

  const NAV_LINKS = isAuthenticated ? AUTH_NAV_LINKS : GUEST_NAV_LINKS;

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-40 w-full bg-white border-b transition-shadow duration-200",
          scrolled ? "shadow-md border-gray-200" : "shadow-sm border-gray-100",
        )}
      >
        <div className="container mx-auto h-[64px] px-4 md:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo — white pill container, logo + brand text vertically centered */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white/50 rounded-xl border border-gray-100 shadow-sm w-12 h-10 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="LiveMentorHub"
                width={120}
                height={120}
                priority
                loading="eager"
                className="w-auto h-12 scale-[1.5] transform group-hover:scale-[1.6] transition-transform duration-300"
                unoptimized
              />
            </div>
            <span className="text-xl font-extrabold text-[#0d1f5c] tracking-tight leading-none">
              Live Mentor Hub
            </span>
          </Link>

          {/* Desktop Nav — centered links */}
          <div className="hidden md:flex items-center gap-[16px]">
            {NAV_LINKS.map((link) => {
              const basePath = link.href.split('?')[0];
              const isActive = pathname === basePath || (basePath !== '/' && pathname?.startsWith(basePath));
              return (
                <button
                  key={link.label}
                  onClick={() => router.push(link.href)}
                  className={cn(
                    "relative font-bold transition-colors text-[15px] px-5 py-2 rounded-full cursor-pointer",
                    isActive ? "text-black" : "text-[#0d1f5c]/70 hover:text-[#0d1f5c]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-[#e8a020] rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3 pr-4">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2 text-[#0d1f5c]/50 hover:text-[#0d1f5c] transition-colors rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsNotifOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 overflow-hidden"
                        >
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-[#0d1f5c] text-sm">Notifications</p>
                            {notifications.length > 0 && (
                              <button onClick={clearAllNotifications} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                                <Trash className="h-3 w-3" />
                                Clear All
                              </button>
                            )}
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {notifLoading ? (
                              <p className="text-center text-sm py-4 text-gray-400">Loading...</p>
                            ) : notifications.length === 0 ? (
                              <p className="text-center text-sm py-4 text-gray-400">No notifications</p>
                            ) : (
                              notifications.map((n) => (
                                <div key={n.notificationId || n.id || n._id} className="flex justify-between items-start px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50">
                                  <div className="text-sm text-gray-600">{n.message}</div>
                                  <button onClick={() => deleteNotification(n.notificationId)} className="text-red-400 hover:text-red-500 ml-2 flex-shrink-0">
                                    <Trash className="h-4 w-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                  >
                    {user?.profileImage ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-white/50">
                        <img
                          src={user.profileImage.startsWith('http') ? user.profileImage : `${API_BASE}${user.profileImage}`}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextSibling as HTMLElement)?.classList.remove('hidden');
                          }}
                        />
                        <div className="h-8 w-8 rounded-full bg-[#0d1f5c] flex items-center justify-center text-white font-bold text-sm hidden">
                          {user.name?.[0] || "U"}
                        </div>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#0d1f5c] flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.[0] || "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-[#0d1f5c] max-w-[100px] truncate">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 text-center">
                            <p className="text-sm font-bold text-[#0d1f5c]">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          </div>
                          <div className="p-1.5 space-y-0.5">
                            <Link
                              href="/student/settings"
                              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-[#0d1f5c] transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Settings className="h-4 w-4" />
                              Settings
                            </Link>
                            <div className="h-px bg-gray-100 my-1 mx-2" />
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="text-[#0d1f5c]/60 hover:text-[#0d1f5c] font-semibold hover:bg-gray-50 rounded-lg px-5 h-10"
                  onClick={() => router.push("/student/auth/login")}
                >
                  Log in
                </Button>
                <Button
                  onClick={() => router.push("/student/auth/signup")}
                  className="rounded-lg bg-[#d4940a] hover:bg-[#e8a020] text-[#0d1f5c] font-bold px-6 h-10 shadow-sm"
                >
                  Sign Up Free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-[#0d1f5c]"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
    </>
  );
}
