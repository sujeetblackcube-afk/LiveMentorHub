"use client";

import React, { useState } from "react";
import { Toast, ToastMessage } from "@/components/ui/Toast";

export function ContactFeature() {
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 7 Contact Channel Divisions
  const contactChannels = [
    {
      title: "Student & Parent Support Desk",
      icon: "🎓",
      phone: "+91 98765 43210",
      email: "students@livementorhub.com",
      hours: "Mon - Sat: 8:00 AM - 8:00 PM",
      desc: "Help with student login, live class schedules, subscription claims & scorecards.",
    },
    {
      title: "Institute & School Onboarding",
      icon: "🏢",
      phone: "+91 98765 43211",
      email: "institutes@livementorhub.com",
      hours: "Mon - Fri: 9:00 AM - 6:00 PM",
      desc: "For coaching directors & principals seeking software setup & batch digitization.",
    },
    {
      title: "WhatsApp Instant Support",
      icon: "💬",
      phone: "+91 98765 43212",
      email: "whatsapp@livementorhub.com",
      hours: "24/7 Instant AI & Live Chat",
      desc: "Fastest response channel for urgent class links & doubt solver help.",
    },
    {
      title: "Teacher & Mentor Recruitment",
      icon: "👨‍🏫",
      phone: "+91 98765 43213",
      email: "mentors@livementorhub.com",
      hours: "Mon - Fri: 10:00 AM - 5:00 PM",
      desc: "For educators looking to host live WebRTC classes or offer private 1-on-1 sessions.",
    },
    {
      title: "Technical Helpdesk",
      icon: "🛠️",
      phone: "+91 98765 43214",
      email: "tech@livementorhub.com",
      hours: "24/7 System Operations",
      desc: "Assistance with video player playback, WebRTC mic/camera permissions & mobile app issues.",
    },
    {
      title: "Franchise & Partner Inquiries",
      icon: "🤝",
      phone: "+91 98765 43215",
      email: "partners@livementorhub.com",
      hours: "Mon - Sat: 10:00 AM - 6:00 PM",
      desc: "Bring LiveMentorHub hybrid coaching centers to your city or local region.",
    },
    {
      title: "Corporate Headquarters",
      icon: "📍",
      phone: "+91 11 4567 8900",
      email: "corporate@livementorhub.com",
      hours: "Mon - Fri: 9:30 AM - 6:00 PM",
      desc: "LiveMentorHub Tower, Plot 42, Laxmi Nagar District Centre, New Delhi - 110092",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setToast({
      id: Date.now().toString(),
      title: "Message Received!",
      message: "Thank you for contacting LiveMentorHub. Our regional representative will reach out to you within 24 hours.",
      icon: "✉️",
    });
  };

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <div className="bg-[#06152D] text-slate-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              CONTACT US
            </span>
            <h1 className="mt-2 text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              We Are Here To Help You <span className="text-amber-400">Succeed.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Have questions about student registration, 1st month free claims, coaching institute onboarding, or technical setup? Reach out to our dedicated support teams.
            </p>
          </div>

          {/* 7 Contact Channel Divisions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {contactChannels.map((ch, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between hover:border-blue-500 transition-all backdrop-blur-md shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{ch.icon}</span>
                    <h3 className="text-base font-bold text-white leading-snug">{ch.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">{ch.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-800 text-xs space-y-1.5 font-medium">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span>📞 {ch.phone}</span>
                  </div>
                  <div className="text-slate-300">✉️ {ch.email}</div>
                  <div className="text-[11px] text-slate-400 font-semibold">⏰ {ch.hours}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Contact Form */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900 p-8 sm:p-12 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-white text-center mb-2">Send Us A Direct Message</h2>
            <p className="text-xs text-slate-400 text-center mb-8">Fill in your details and select your inquiry department.</p>

            {submitted ? (
              <div className="text-center py-12">
                <span className="text-5xl">✅</span>
                <h3 className="mt-4 text-2xl font-bold text-white">Message Sent Successfully!</h3>
                <p className="mt-2 text-xs text-slate-300">Our representative will get back to you shortly via phone or email.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">Email Address *</label>
                    <input
                      required
                      type="email"
                      placeholder="rahul@example.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">Inquiry Department *</label>
                    <select className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none">
                      <option>Student / Parent Free Trial Claim</option>
                      <option>Coaching Institute Onboarding</option>
                      <option>Teacher Studio / WebRTC Setup</option>
                      <option>Technical Helpdesk Support</option>
                      <option>Franchise &amp; Partner Network</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please describe how we can assist you..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-black text-white shadow-lg hover:bg-blue-500 transition-all cursor-pointer"
                >
                  Send Message To Support →
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
