"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CreateAccountFeature() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Student Portal login
    window.location.href = "/student/";
  };

  return (
    <div className="bg-[#06152D] text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Dark Blue Panel matching Image 2 */}
        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#081F44] to-[#0A2756] p-8 lg:p-12 border border-slate-700/60 shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

          <div>
            {/* Tag */}
            <div className="flex items-center gap-2 mb-6">
              <span className="h-1 w-8 bg-amber-400 rounded-full"></span>
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                LIVE. GUIDED. PERSONAL.
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Build a learning path that <span className="text-amber-400">moves</span> you.
            </h1>

            <p className="mt-6 text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-md">
              Start with the classes, mentors and tools that fit your goals - then grow with confidence.
            </p>
          </div>

          {/* Bottom Card on Left Panel matching Image 2 */}
          <div className="mt-12 rounded-2xl bg-blue-950/60 p-4 border border-blue-500/30 flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white text-xs shrink-0">
              01
            </span>
            <div className="text-xs">
              <strong className="text-white block font-bold">Free to get started.</strong>
              <span className="text-slate-300">Find the guidance that helps you move forward.</span>
            </div>
          </div>
        </div>

        {/* Right White Card Container matching Image 2 */}
        <div className="rounded-3xl bg-white text-slate-900 p-8 sm:p-12 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1">
                ← Back to website
              </Link>
            </div>

            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
              GET STARTED
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Create your free account
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Set up your learning profile in under a minute.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What are you learning?</label>
                <select
                  required
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="">Select your goal</option>
                  <option value="cbse10">CBSE Class 10 Board Prep</option>
                  <option value="cbse12">CBSE Class 12 Board Prep</option>
                  <option value="jee">IIT-JEE Engineering Entrance</option>
                  <option value="neet">NEET Medical Entrance</option>
                  <option value="upsc">UPSC &amp; Civil Services</option>
                  <option value="other">Other Tuitions &amp; Skills</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-blue-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-xs font-medium text-slate-600">
                  I agree to the <Link href="/terms" className="text-blue-600 font-bold hover:underline">Terms and Privacy Policy</Link>.
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-lg hover:bg-blue-500 transition-all cursor-pointer"
              >
                Create free account →
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Start with the right path for you. </span>
            <Link href="/get-started" className="font-bold text-blue-600 hover:underline">
              Choose your role
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
