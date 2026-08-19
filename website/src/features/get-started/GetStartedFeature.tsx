"use client";

import React from "react";

export function GetStartedFeature() {
  const roles = [
    {
      title: "Student",
      desc: "Access live HD classes, recorded lecture vault, study PDFs & online mock test scorecards.",
      cta: "Login as Student →",
      href: "/student/",
      isExternal: true,
      icon: "🎓",
    },
    {
      title: "Parent",
      desc: "Track your child's daily class attendance, mock test rankings, and mentor feedback.",
      cta: "Login as Parent →",
      href: "/student/",
      isExternal: true,
      icon: "👨‍👩‍👧",
    },
    {
      title: "Teacher",
      desc: "Broadcast HD WebRTC live classes, share lecture notes, and moderate student Q&A.",
      cta: "Login as Teacher →",
      href: "/teacher/",
      isExternal: true,
      icon: "👨‍🏫",
    },
    {
      title: "Institution",
      desc: "Manage coaching center batch rosters, faculty assignments, and branch analytics.",
      cta: "Login as Institution →",
      href: "/institute",
      isExternal: false,
      icon: "🏢",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#06152D] via-[#081F44] to-[#06152D] text-white min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          {/* Yellow accent bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1 w-8 bg-amber-400 rounded-full"></span>
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              GET STARTED WITH LiveMentorHub
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            First, tell us: <span className="text-amber-400">how can we help?</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
            Choose your portal role to continue. We&apos;ll guide you directly to your personalized LiveMentorHub portal.
          </p>
        </div>

        {/* 4 Clean Cards: Student, Parent, Teacher, Institution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((r, idx) => (
            <a
              key={idx}
              href={r.href}
              target={r.isExternal ? "_blank" : undefined}
              rel={r.isExternal ? "noopener noreferrer" : undefined}
              className="group rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8 flex flex-col justify-between backdrop-blur-md shadow-2xl hover:border-amber-400 transition-all hover:-translate-y-1.5 cursor-pointer"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  {r.icon}
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{r.title}</h3>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed font-medium">
                  {r.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1 transition-colors">
                  <span>{r.cta}</span>
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Card */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex items-center gap-4 text-xs text-slate-300">
          <span className="text-2xl text-blue-400">✦</span>
          <div>
            <strong className="text-white block font-bold text-sm">Choose a portal to continue</strong>
            <span className="text-slate-400">Your entry point will be personalized for the way you learn, teach, guide or manage.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
