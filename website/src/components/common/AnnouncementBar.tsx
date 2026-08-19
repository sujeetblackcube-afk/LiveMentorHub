"use client";

import React from "react";
import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="relative z-50 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 px-4 py-2 text-center text-xs sm:text-sm font-bold text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 flex-wrap">
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
          🎓 WELCOME TO LIVEMENTORHUB
        </span>
        <span>India&apos;s Unified Live Mentorship, Coaching &amp; Parent Portal</span>
        <Link
          href="/get-started"
          className="ml-2 rounded-full bg-white px-3 py-1 text-xs font-black text-blue-800 shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          Explore Portals →
        </Link>
      </div>
    </div>
  );
}
