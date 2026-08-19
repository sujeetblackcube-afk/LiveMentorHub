"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Toast, ToastMessage } from "@/components/ui/Toast";

export function InstituteFeature() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 7 Institute Divisions
  const instituteDivisions = [
    {
      title: "Batch & Student Roster Control",
      icon: "📋",
      desc: "Create grade-wise batches, assign faculty members, and maintain automated student enrollment records with zero software overhead.",
    },
    {
      title: "WebRTC HD Broadcast Studio",
      icon: "🎥",
      desc: "Equip coaching teachers with low-latency live streaming tools, screen sharing, raise-hand student queues, and live whiteboards.",
    },
    {
      title: "Automated Cloud Recording Engine",
      icon: "☁️",
      desc: "Every live broadcast automatically records to cloud storage, allowing absent students to rewatch lectures 24/7.",
    },
    {
      title: "Verified Directory Listing",
      icon: "🛡️",
      desc: "Get listed as a verified coaching center on LiveMentorHub's nationwide location search directory to attract new student admissions.",
    },
    {
      title: "Parent SMS & Attendance Sync",
      icon: "📱",
      desc: "Automated attendance tracking during live classes. Parents receive transparent attendance logs and progress reports.",
    },
    {
      title: "Online Mock Test Publisher",
      icon: "📝",
      desc: "Upload question banks, publish automated rank cards, and share detailed test scorecards with instant percentile calculations.",
    },
    {
      title: "Institute Analytics Dashboard",
      icon: "📊",
      desc: "Track student retention, teacher lecture hours, student feedback ratings, and batch analytics in one central portal.",
    },
  ];

  const handleRegister = () => {
    setToast({
      id: Date.now().toString(),
      title: "🏢 Institute Onboarding Request",
      message: "Your onboarding request has been submitted! An institute specialist will contact your director within 24 hours.",
      icon: "🏢",
    });
  };

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <div className="bg-[#06152D] text-slate-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Under Development Banner */}
          <div className="mb-10 mx-auto max-w-2xl rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 text-center backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base">
              <span className="text-xl">🚧</span>
              <span>Institute Portal is Still Under Development</span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-amber-200/90 font-medium leading-relaxed">
              We are actively building the complete Institute &amp; Coaching Partner Portal suite. You can register your institute below to get early access when we launch!
            </p>
          </div>
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
              🏢 Institute Portal &amp; Coaching Partner Network
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Digitize Your Coaching Center With <span className="text-emerald-400">Zero Hardware Setup</span>
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Transform your local coaching institute into a tech-powered hybrid learning center. Stream live classes, automate recordings, and track student attendance seamlessly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleRegister}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all cursor-pointer"
              >
                🚀 Register Institute Today
              </button>
              <Link
                href="/contact"
                className="rounded-full border border-slate-700 bg-slate-800 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-700 transition-all"
              >
                Schedule Institute Demo
              </Link>
            </div>
          </div>

          {/* 7 Divisions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {instituteDivisions.map((div, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 hover:border-emerald-500 transition-all shadow-xl"
              >
                <span className="text-4xl mb-3 block">{div.icon}</span>
                <h3 className="text-base font-bold text-white">{div.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">{div.desc}</p>
              </div>
            ))}
          </div>

          {/* Clean Enterprise Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 border border-indigo-500/30 shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-white">Enterprise Coaching Management System</h2>
            <p className="mt-2 text-xs text-slate-300 max-w-xl mx-auto">
              Empower your institute faculty, engage parents, and deliver seamless hybrid online-offline learning without expensive server infrastructure.
            </p>
            <div className="mt-6">
              <button
                onClick={handleRegister}
                className="rounded-full bg-blue-600 px-8 py-3 text-xs font-bold text-white shadow-lg hover:bg-blue-500 transition-all cursor-pointer"
              >
                Get Started With Your Institute →
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
