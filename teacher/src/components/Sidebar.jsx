import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  HelpCircle,
  UserCog,
  FileQuestion,
  ClipboardList,
  GraduationCap,
  Home,
  Table2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  TrendingUp
} from "lucide-react";

import { theme } from "../theme.js";

const menu = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },

  { label: "Alloted Courses", icon: GraduationCap, path: "/courses" },

  {
    label: "Classes",
    icon: BookOpen,
    path: "/classes",
  },

  {
    label: "Students",
    icon: Users,
    path: "/students",
  },

  {
    label: "Student Submission",
    icon: ClipboardCheck,
    submenu: [
      { label: "Submitted Assignments", path: "/submitted-assignments" },
      { label: "Submitted Tests", path: "/submitted-tests" },
    ],
  },

  {
    label: "Questions",
    icon: FileQuestion,
    path: "/questions",
  },

  {
    label: "Tests",
    icon: ClipboardList,
    path: "/tests",
  },

  {
    label: "Doubt",
    icon: HelpCircle,
    path: "/doubts",
  },

  {
    label: "Subscription",
    icon: CreditCard,
    path: "/subscription",
  },
  {
    label: "Earning History",
    icon: TrendingUp,
    path: "/earning",
  },

  {
    label: "Profile",
    icon: UserCog,
    path: "/profile",
  },
];

export default function Sidebar({ collapsed }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };
  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r flex flex-col transition-all duration-300 overflow-y-auto ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ backgroundColor: theme.colors.sidebar }}
    >
      {/* Logo */}
      <div
  className={`flex items-center gap-2 px-6 py-5 text-xl font-bold transition-all duration-300 ${
    collapsed ? "justify-center" : ""
  }`}
  style={{ color: theme.logo.accent }}
>
  <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
    <img
      src="/teacher/logo.png"
      alt="Logo"
      className="w-full h-full object-contain"
    />
  </div>

  {!collapsed && theme.logo.text}
</div>

      {/* Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = item.path && location.pathname === item.path;

          if (item.submenu) {
            const isOpen = openMenu === item.label;
            const isParentActive = item.submenu.some(
              (sub) => location.pathname === sub.path,
            );

            return (
              <div key={item.label} className="relative">
                {/* Parent */}
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: isParentActive
                      ? theme.colors.secondary
                      : hoveredItem === item.label
                        ? theme.colors.secondary
                        : "transparent",
                    color: isParentActive
                      ? theme.colors.primary
                      : theme.colors.textPrimary,
                    fontWeight: isParentActive ? "600" : "normal",
                  }}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    className={`flex items-center gap-3 ${
                      collapsed ? "justify-center w-full" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>

                  {!collapsed &&
                    (isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    ))}
                </button>

                {/* Submenu */}
                {isOpen && (
                  <div
                    className={`${
                      collapsed
                        ? "absolute left-0 top-full w-48 shadow-lg z-10"
                        : "ml-10 mt-1"
                    } space-y-1`}
                    style={{
                      backgroundColor: theme.colors.sidebar,
                      border: collapsed
                        ? `1px solid ${theme.colors.border}`
                        : "none",
                    }}
                  >
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.path}
                        className={`block ${
                          collapsed ? "px-4 py-2 text-sm" : "px-3 py-2 text-sm"
                        } rounded-md transition`}
                        style={{
                          backgroundColor:
                            location.pathname === sub.path
                              ? theme.colors.secondary
                              : hoveredItem === sub.label
                                ? theme.colors.secondary
                                : "transparent",
                          color:
                            location.pathname === sub.path
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                          fontWeight:
                            location.pathname === sub.path ? "500" : "normal",
                        }}
                        onMouseEnter={() => setHoveredItem(sub.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => setOpenMenu(null)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          /* Normal menu item */
          return (
            <Link
              key={item.label}
              to={item.path || "#"}
              className="flex items-center px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: isActive
                  ? theme.colors.secondary
                  : hoveredItem === item.label
                    ? theme.colors.secondary
                    : "transparent",
                color: isActive
                  ? theme.colors.primary
                  : theme.colors.textPrimary,
                fontWeight: isActive ? "600" : "normal",
              }}
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-6 py-4"
        style={{ borderTop: `1px solid ${theme.colors.border}` }}
      >
        {!collapsed ? (
          <>
            <p
              className="text-xs mb-2 tracking-widest"
              style={{ color: theme.colors.textSecondary }}
            >
              RETURN TO
            </p>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              style={{
                color:
                  hoveredItem === "footer"
                    ? theme.colors.primary
                    : theme.colors.textPrimary,
              }}
              onMouseEnter={() => setHoveredItem("footer")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Home className="w-4 h-4" />
              Main Dashboard
            </Link>
          </>
        ) : (
          <div
            className="flex justify-center"
            style={{ color: theme.colors.primary }}
          >
            <Home className="w-5 h-5" />
          </div>
        )}
      </div>
    </aside>
  );
}
