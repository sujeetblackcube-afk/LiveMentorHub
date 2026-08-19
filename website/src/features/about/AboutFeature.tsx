"use client";

import React from "react";
import Link from "next/link";

export function AboutFeature() {
  // 7 Core Pillars / Divisions
  const aboutPillars = [
    {
      title: "1. Our Founding Vision",
      icon: "🚀",
      desc: "LiveMentorHub was founded with a singular purpose: to bridge the gap between physical coaching institutes and digital learning accessibility across India. Every student deserves real-time mentorship, regardless of their location.",
    },
    {
      title: "2. Core Mission & Values",
      icon: "💡",
      desc: "We empower educators and institutes with zero-friction live streaming technology, automated cloud recording archives, and transparent parent progress synchronization.",
    },
    {
      title: "3. Educator & Mentor Excellence",
      icon: "👨‍🏫",
      desc: "Over 500+ top-rated subject specialists from IITs, AIIMS, and leading coaching hubs deliver interactive HD live streams, personalized feedback, and 1-on-1 doubt solving.",
    },
    {
      title: "4. Parent & Family Transparency",
      icon: "👨‍👩‍👧",
      desc: "We believe parents are vital partners in education. LiveMentorHub provides real-time class attendance monitoring, mock test scorecards, and direct communication with institute mentors.",
    },
    {
      title: "5. Zero-Hardware Institute Digitization",
      icon: "🏢",
      desc: "Local coaching centers can digitize their entire student roster, batch timetables, and lecture broadcasts with zero IT hardware investment.",
    },
    {
      title: "6. Interactive Learning Innovations",
      icon: "⚡",
      desc: "From WebRTC low-latency streaming and real-time raise hand queues to interactive whiteboards and drag-and-drop doubt resolution, we bring physical classroom energy online.",
    },
    {
      title: "7. Nationwide Impact & Milestones",
      icon: "🏆",
      desc: "Trusted by 10,000+ active learners, 1,200+ partner coaching institutes, and over 50,000+ hours of automated cloud video recordings across 28 states.",
    },
  ];

  const milestones = [
    { value: "10,000+", label: "Active Students" },
    { value: "1,200+", label: "Partner Institutes" },
    { value: "500+", label: "Expert Mentors" },
    { value: "28", label: "States Covered" },
    { value: "98%", label: "Exam Success Rate" },
    { value: "50,000+", label: "Cloud Video Hours" },
    { value: "4.9/5", label: "Average Rating" },
  ];

  return (
    <div className="bg-[#06152D] text-slate-100 py-16 sm:py-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-blue-400">
            ABOUT LIVEMENTORHUB
          </span>
          <h1 className="mt-2 text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Confidence Changes The Way You <span className="text-amber-400">Learn.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            LiveMentorHub is India&apos;s enterprise live mentorship and coaching ecosystem, transforming traditional coaching centers into tech-enabled hybrid learning centers for students, parents, and teachers nationwide.
          </p>
        </div>

        {/* 7 Core Divisions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {aboutPillars.map((p, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 flex flex-col justify-between hover:border-blue-500 transition-all shadow-xl backdrop-blur-md"
            >
              <div>
                <span className="text-4xl mb-4 block">{p.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Milestone Metrics Row */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 sm:p-12 mb-16 shadow-2xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">OUR NATIONWIDE FOOTPRINT</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">LiveMentorHub By The Numbers</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
            {milestones.map((m, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-800/60 p-4 border border-slate-700/50">
                <div className="text-2xl font-black text-blue-400">{m.value}</div>
                <div className="text-[10px] font-bold text-slate-300 uppercase mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 sm:p-12 text-center text-white border border-white/10 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white">Join The LiveMentorHub Movement Today</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Whether you are a student striving for board top ranks, a parent seeking transparency, or an institute expanding digital reach — LiveMentorHub is your partner.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/get-started"
              className="rounded-full bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-blue-500 transition-all hover:scale-105"
            >
              Get Started Now →
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-700 bg-slate-800 px-6 py-3.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
