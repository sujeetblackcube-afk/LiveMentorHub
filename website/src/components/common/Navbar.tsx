"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        
        {/* 1. LEFT DIV: Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 text-[#0d1f5c]">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-blue-50 p-0.5 shadow-sm border border-blue-100">
            <Image
              src="/logo.png"
              alt="LiveMentorHub Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-[#0d1f5c] flex items-center">
              LiveMentor<span className="text-blue-600">Hub</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              LEARN. CONNECT. GROW.
            </span>
          </div>
        </Link>

        {/* 2. RIGHT DIV: Grouping Navigation Links AND Get Started Button together on the Right */}
        <div className="hidden items-center gap-8 lg:flex">
          {/* Nav Links */}
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-700 hover:text-blue-600"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <Link
            href="/get-started"
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all hover:scale-105"
          >
            <span>Get Started →</span>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-slate-700 hover:bg-slate-50 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-gray-200 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/get-started"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 rounded-full bg-blue-600 px-4 py-3 text-center text-xs font-bold text-white shadow-md"
            >
              Get Started →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
