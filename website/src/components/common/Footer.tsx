"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  const footerLinks = {
    platform: [
      { name: "How It Works", href: "/#how-it-works" },
      { name: "Browse Courses", href: "/courses" },
      { name: "Institute Network", href: "/institute" },
      { name: "Get Started", href: "/get-started" },
    ],
    roles: [
      { name: "Student Portal", href: "/get-started" },
      { name: "Parent Dashboard", href: "/get-started" },
      { name: "Teacher Studio", href: "/get-started" },
      { name: "Institute Onboarding", href: "/institute" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Preferences", href: "/cookies" },
      { name: "Contact & Support", href: "/contact" },
    ],
  };

  return (
    <footer className="border-t border-slate-800 bg-[#06152D] text-slate-300 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-black text-white">
                LM
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                LiveMentor<span className="text-blue-400">Hub</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-xs text-slate-400 leading-relaxed font-medium">
              India&apos;s Unified Live Mentorship &amp; Coaching Platform. Connecting students, institutes, and teachers nationwide in real-time.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-400">
              <span>📍 Nationwide Institute Search</span>
              <span>•</span>
              <span>🎓 1,000+ Verified Mentors</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Platform</h4>
            <ul className="mt-4 space-y-2 text-xs">
              {footerLinks.platform.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Role Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Ecosystem</h4>
            <ul className="mt-4 space-y-2 text-xs">
              {footerLinks.roles.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Legal &amp; Help</h4>
            <ul className="mt-4 space-y-2 text-xs">
              {footerLinks.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-800/80 pt-6 text-center text-[11px] text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} LiveMentorHub. All rights reserved. &ldquo;Learn Anytime. Anywhere. Never Miss a Class.&rdquo;</p>
        </div>
      </div>
    </footer>
  );
}
