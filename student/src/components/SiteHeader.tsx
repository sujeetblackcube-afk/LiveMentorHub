"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Video, HelpCircle, BarChart2, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@/store/useAuth";
import { useAuthModal } from "@/store/useAuthModal";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Live", href: "/live", icon: Video },
  { name: "Doubts", href: "/doubt", icon: HelpCircle },
  { name: "Progress", href: "/progress", icon: BarChart2 },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { openLogin } = useAuthModal();

  if (pathname === "/login") return null;

  return (
    <header
      className="sticky top-0 z-50 w-full rounded-b-2xl shadow-md"
      style={{ backgroundColor: "var(--header-bg)" }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:h-16">
        {/* Logo: C+ */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
            <span className="text-sm font-bold text-gray-700">C</span>
            <span className="-ml-0.5 text-xs font-bold text-[var(--accent-blue)]">+</span>
          </div>
          <div className="hidden sm:block">
            <span className="block text-lg font-bold text-white leading-tight">Live Mentor Hub</span>
            <span className="block text-xs text-white/80 leading-tight">Student</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: bell + profile/login */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative rounded-lg p-2 text-white/90 hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/auth/login";
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-red-300 transition-colors"
                title="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={openLogin}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white outline outline-2 outline-white/50 hover:bg-white/10"
              style={{ backgroundColor: "var(--header-bg)" }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
