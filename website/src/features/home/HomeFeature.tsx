"use client";

import React from "react";
import Link from "next/link";

export function HomeFeature() {
  // 7 Metrics Divisions
  const stats = [
    { value: "4.9/5", label: "Average Learner Rating", desc: "Based on 15,000+ verified student reviews" },
    { value: "10,000+", label: "Learners Supported", desc: "Across 28 states & union territories" },
    { value: "95%", label: "Would Recommend Us", desc: "High student & parent satisfaction rate" },
    { value: "500+", label: "Verified Expert Mentors", desc: "Top educators from IITs, AIIMS & top institutes" },
    { value: "1,200+", label: "Partner Coaching Centers", desc: "Connected hybrid learning institutes" },
    { value: "50,000+", label: "Hours of HD Recordings", desc: "Automated cloud video archive" },
    { value: "98%", label: "Exam Success Rate", desc: "In Board Exams, JEE, NEET & UPSC" },
  ];

  // 7 Detailed Testimonial Story Cards (Image 1 Style)
  const testimonials = [
    {
      quote: "The teachers make difficult concepts feel possible. I started asking questions instead of staying quiet in class.",
      author: "Ananya R.",
      role: "Class 10 - CBSE Board",
      score: "96.4% in Board Exams",
      stars: 5,
    },
    {
      quote: "My mentor helped me build a revision routine that I could actually follow. My confidence before tests is completely different.",
      author: "Rohan K.",
      role: "JEE Aspirant (Rank 1,420)",
      score: "IIT-JEE Main Qualified",
      stars: 5,
    },
    {
      quote: "Live classes make it easy to clear doubts in the moment. The recordings are a huge help when I want to revise before exams.",
      author: "Ishita S.",
      role: "Class 12 - NEET Medical",
      score: "Score: 685/720",
      stars: 5,
    },
    {
      quote: "As a parent, I get complete visibility into my son's attendance and test performance scorecards. Highly transparent system!",
      author: "Rajesh Kumar (Parent)",
      role: "Parent of Class 9 Student",
      score: "Verified Parent Review",
      stars: 5,
    },
    {
      quote: "The instant 1-on-1 doubt solver and study notes saved my final term preparation. I cleared all physics concepts in 2 weeks.",
      author: "Priya Sharma",
      role: "Class 11 - Science Physics",
      score: "94% Term 1 Physics",
      stars: 5,
    },
    {
      quote: "Our coaching institute transitioned 400+ students to hybrid mode in 24 hours. The automated recording library is amazing.",
      author: "Director V. K. Gupta",
      role: "Gupta Classes, Delhi",
      score: "Verified Institute Director",
      stars: 5,
    },
    {
      quote: "The live interactive whiteboard and real-time hand raise feature make online learning feel just like a physical classroom.",
      author: "Arjun Verma",
      role: "CA Foundation Aspirant",
      score: "Passed CA Foundation",
      stars: 5,
    },
  ];

  // 7 How It Works Divisions
  const howItWorksSteps = [
    { step: "01", title: "Choose Your Learning Path", desc: "Select whether you are a Student, Parent, Teacher, or Coaching Institute." },
    { step: "02", title: "Explore Verified Mentors", desc: "Browse top-rated subject specialists and local coaching institutes near you." },
    { step: "03", title: "Join Live HD Classes", desc: "Attend low-latency interactive live streams with chat, raise hands, and Q&A." },
    { step: "04", title: "Instant Doubt Resolution", desc: "Ask doubts during live sessions or upload screenshots for step-by-step mentor answers." },
    { step: "05", title: "Access Recorded Vault", desc: "Rewatch every past live class with speed control and downloadable study PDFs." },
    { step: "06", title: "Attempt Online Mock Tests", desc: "Test your skills with automated rank cards, detailed solutions, and time analysis." },
    { step: "07", title: "Parent Progress Sync", desc: "Parents receive automated SMS updates and transparent attendance scorecards." },
  ];

  // 8 Subject & Exam Divisions
  const examDivisions = [
    { title: "CBSE & State Boards (6th-12th)", icon: "📚", count: "850+ Batches", desc: "Mathematics, Physics, Chemistry, Biology & English" },
    { title: "IIT-JEE Main & Advanced", icon: "⚡", count: "420+ Batches", desc: "Advanced Problem Solving, Vector Physics & Organic Chemistry" },
    { title: "NEET-UG Medical Entrance", icon: "🩺", count: "380+ Batches", desc: "Botany, Zoology, Physical Chemistry & Physics Drills" },
    { title: "UPSC & Civil Services", icon: "🏛️", count: "210+ Batches", desc: "General Studies, CSAT, Essay Writing & Optional Subjects" },
    { title: "CA, CS & Commerce", icon: "📊", count: "160+ Batches", desc: "Accountancy, Economics, Business Studies & Tax Laws" },
    { title: "CUET & Central Universities", icon: "🎓", count: "300+ Batches", desc: "Domain Specific Prep, General Test & Verbal Ability" },
    { title: "Olympiad & NTSE Foundation", icon: "🏆", count: "190+ Batches", desc: "Mental Ability, Advanced Science & Mathematics" },
    { title: "Spoken English & Personality", icon: "🗣️", count: "240+ Batches", desc: "Fluency Drills, Public Speaking & Interview Coaching" },
  ];

  // 7 Core Platform Features
  const features = [
    { title: "HD WebRTC Live Classroom", icon: "🎥", desc: "Ultra-low latency live video streaming with screen sharing and multi-camera support." },
    { title: "Interactive Raise Hand & Chat", icon: "✋", desc: "Students can raise hands during live sessions to talk directly with mentors." },
    { title: "Automated Cloud Recording", icon: "☁️", desc: "Zero manual effort. Every live broadcast records automatically to cloud storage." },
    { title: "Drag-and-Drop Doubt Solver", icon: "❓", desc: "Submit homework photo doubts and receive verified mentor explanations." },
    { title: "Online Mock Test Engine", icon: "📝", desc: "Attempt timed test papers with instant scorecards, percentiles, and rank analytics." },
    { title: "Parent Performance Portal", icon: "👨‍👩‍👧", desc: "Real-time student attendance monitoring, test score history, and mentor notes." },
    { title: "Downloadable PDF Vault", icon: "📄", desc: "Access handwritten mentor lecture notes, daily practice problems (DPP), and assignments." },
  ];

  // 7 FAQs Divisions (No Trial / Pricing Questions)
  const faqs = [
    { q: "What is LiveMentorHub?", a: "LiveMentorHub is India's unified live mentorship and coaching platform connecting students, parents, teachers, and coaching institutes." },
    { q: "How can parents monitor student progress?", a: "Parents get dedicated login access to view daily class attendance logs, test score cards, and mentor performance comments." },
    { q: "How do coaching institutes get started?", a: "Institutes can register via the Institute Portal (/institute). Our team sets up your batch rosters and teacher studios within 24 hours." },
    { q: "Can I watch recordings if I miss a live class?", a: "Absolutely. Every live class is automatically saved in HD cloud storage and available 24/7 with speed control." },
    { q: "What devices are supported?", a: "LiveMentorHub works seamlessly on laptops, desktop browsers, tablets, and Android/iOS smartphones." },
    { q: "How does the doubt solving feature work?", a: "Students can ask doubts live during class or upload photos of homework questions anytime to get step-by-step solutions." },
    { q: "How do teachers stream live classes?", a: "Teachers log into the WebRTC Teacher Studio (/teacher/) to stream HD video, share screen slides, and interact with students." },
  ];

  return (
    <div className="flex flex-col bg-[#06152D] text-slate-100 min-h-screen">
      {/* 1. HERO BANNER (Matching Screenshot 1) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#06152D] via-[#081C3D] to-[#0A234B] pt-16 pb-24 border-b border-slate-800/60">
        <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <div className="h-96 w-[500px] rounded-full border-2 border-blue-400/40"></div>
          <div className="absolute inset-8 rounded-full border-2 border-blue-400/30"></div>
          <div className="absolute inset-16 rounded-full border-2 border-blue-400/20"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1 w-8 bg-amber-400 rounded-full"></span>
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                LEARNER STORIES &amp; LIVE MENTORSHIP
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Confidence changes the way you <span className="text-sky-400">learn.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-medium">
              Real stories from learners and families who use LiveMentorHub to ask more, understand better and make steady progress.
            </p>

            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <Link
                href="/get-started"
                className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all hover:scale-105"
              >
                Get Started →
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-700 transition-all"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS DIVISION (7 DIVISIONS - WHITE SECTION MATCHING SCREENSHOT 1) */}
      <section className="bg-slate-50 py-16 text-slate-900 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Platform Metrics</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Trusted By Students &amp; Families Nationwide</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((st, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="text-3xl font-extrabold text-blue-600 tracking-tight">{st.value}</div>
                  <div className="mt-1 text-xs font-bold text-slate-900 uppercase tracking-wider">{st.label}</div>
                </div>
                <p className="mt-3 text-[11px] text-slate-500 font-medium">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TESTIMONIALS DIVISION (7 DETAILED STORY CARDS MATCHING SCREENSHOT 1) */}
      <section className="bg-slate-100 py-16 text-slate-900 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Real Student &amp; Parent Reviews</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">What Our Learners &amp; Families Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-serif text-blue-500 font-bold leading-none">&ldquo;</span>
                    <div className="flex text-amber-400 text-xs">{"★".repeat(t.stars)}</div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {t.quote}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{t.author}</h4>
                    <span className="text-[11px] text-slate-500 block">{t.role}</span>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 border border-blue-100">
                    {t.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS DIVISION (7 STEPS) */}
      <section id="how-it-works" className="py-20 bg-[#06152D] text-white border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">Simple Step-by-Step Flow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">How LiveMentorHub Works</h2>
            <p className="mt-2 text-xs text-slate-400">7 seamless steps from registration to exam success.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between">
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 font-black text-sm border border-blue-500/30 mb-4">
                    {step.step}
                  </span>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXAM & SUBJECT DIVISIONS (8 COURSES / EXAMS) */}
      <section id="resources" className="py-20 bg-gradient-to-b from-[#06152D] to-[#081F44] text-white border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-sky-400 uppercase tracking-widest">Academic Categories</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Supported Subjects &amp; Exam Divisions</h2>
            <p className="mt-2 text-xs text-slate-400">Comprehensive mentorship for all grades, competitive exams &amp; skills.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {examDivisions.map((ex, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 hover:border-sky-500 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{ex.icon}</span>
                  <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/30">
                    {ex.count}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{ex.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CORE FEATURES DIVISION (7 FEATURE CARDS) */}
      <section className="py-20 bg-[#06152D] text-white border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">7 Core Live Mentorship Features</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-500 transition-all">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ROLE DIVISIONS (Matching Screenshot 3) */}
      {/* <section className="py-20 bg-gradient-to-b from-[#06152D] via-[#081F44] to-[#06152D] text-white border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1 w-8 bg-amber-400 rounded-full"></span>
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                GET STARTED WITH LiveMentorHub
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              First, tell us: <span className="text-amber-400">how can we help?</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-300 font-medium">
              Choose the role that best describes you. We&apos;ll guide you to the right LiveMentorHub experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleDivisions.map((r, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-blue-500 transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl mb-4">
                    {r.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white">{r.title}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">
                    {r.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <a
                    href={r.href}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>{r.cta}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* 8. FAQ DIVISION (7 FREQUENT QUESTIONS) */}
      <section className="py-20 bg-[#06152D] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">Frequently Asked Questions</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Got Questions? We Have Answers.</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-blue-400 font-extrabold">Q{idx + 1}.</span> {faq.q}
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed font-medium pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
