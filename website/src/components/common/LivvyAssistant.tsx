"use client";

import React, { useState } from "react";

export function LivvyAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Speech Bubble */}
      {!isOpen && (
        <div className="mb-2 max-w-[210px] rounded-2xl bg-white p-3 text-xs font-semibold text-slate-800 shadow-xl border border-slate-200 animate-bounce">
          <p className="font-bold text-blue-700 text-[11px]">Hi, I&apos;m Livvy!</p>
          <p className="text-[11px] text-slate-600">Your learning companion.</p>
        </div>
      )}

      {/* Expanded Livvy Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-3xl border border-blue-500/30 bg-slate-900 p-5 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-lg">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Livvy Assistant</h4>
                <span className="text-[10px] text-emerald-400 font-bold">● Online &amp; Ready</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="my-4 text-xs text-slate-300 space-y-2">
            <p className="rounded-xl bg-slate-800/80 p-3 leading-relaxed">
              Hello! Need help choosing a course, registering your coaching institute, or logging in as a student?
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href="/get-started"
              className="rounded-xl bg-blue-600 px-3 py-2 text-center text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              Get Started →
            </a>
            <a
              href="/contact"
              className="rounded-xl bg-slate-800 px-3 py-2 text-center text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Talk to Support
            </a>
          </div>
        </div>
      )}

      {/* Floating Button / Mascot Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-2xl shadow-2xl transition-transform hover:scale-110 active:scale-95 border-2 border-white/30 cursor-pointer"
        aria-label="Open Livvy Companion Chat"
      >
        🤖
      </button>
    </div>
  );
}
