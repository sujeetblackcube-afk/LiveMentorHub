"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
    ArrowRight,
    Star,
    Users,
    BookOpen,
    Play,
    CheckCircle2,
    Target,
    MessageCircle,
    Video,
    FileText,
    ChevronDown,
    Award,
    Phone,
    Mail,
    BadgeCheck,
    Zap,
    HeadphonesIcon,
    TrendingUp,
    Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex justify-between items-center text-left group"
            >
                <span className="text-base font-semibold text-[#0d1f5c] group-hover:text-[#d4940a] transition-colors pr-4">{question}</span>
                <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#d4940a] rotate-180" : "bg-gray-100"}`}>
                    <ChevronDown className={`h-4 w-4 ${isOpen ? "text-white" : "text-gray-400"}`} />
                </div>
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <p className="pb-5 text-gray-500 leading-relaxed text-sm">{answer}</p>
            </motion.div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
            <Navbar />

            {/* ────────────────────────────────────────────────
                HERO — Solid Navy #1a2456
            ──────────────────────────────────────────────── */}
            <section className="relative py-16 md:py-24 overflow-hidden min-h-[580px] flex items-center bg-[#1a2456]">
                {/* Backgrounds */}
                <div className="absolute inset-0 z-0">
                    {/* Faint gold circle */}
                    <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full border-[1.5px] border-[#e8a020]/15" />
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* LEFT COLUMN — Navy Background */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4940a] bg-black/10 backdrop-blur-sm px-4 py-1.5">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-sm font-medium text-white/90">India&apos;s #1 Learning Platform</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-[2.5rem] md:text-5xl lg:text-[3.5rem] font-black leading-[1.15] tracking-tight">
                                <span className="text-white block">Connect with Live Mentor,</span>
                                <span className="text-[#d4940a] block">Build Your Career Fast</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                                Join India&apos;s most trusted learning platform. Get personalized guidance from expert mentors and accelerate your path to success.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                                <Link href="/student/auth/login">
                                    <Button size="lg" className="bg-[#d4940a] hover:bg-[#c5880a] text-[#0d1f5c] rounded-lg h-12 px-8 text-base font-bold shadow-md transition-all">
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>

                                <a
                                    href="/teacher"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="bg-white hover:bg-gray-50 text-[#0d1f5c] rounded-lg h-12 px-8 text-base font-bold shadow-md transition-all border border-gray-200"
                                    >
                                        Teacher Panel
                                    </Button>
                                </a>

                                <a
                                    href="/admin"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="bg-white hover:bg-gray-50 text-[#0d1f5c] rounded-lg h-12 px-8 text-base font-bold shadow-md transition-all border border-gray-200"
                                    >
                                        Admin Panel
                                    </Button>
                                </a>
                            </div>


                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center gap-5 pt-4">
                                {["Free Registration", "Live Doubt Solving", "Certificate Included"].map((text) => (
                                    <div key={text} className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                        <span className="text-sm font-medium text-white/60">{text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className="h-10 w-10 rounded-full border-2 border-[#0d1f5c] bg-gray-200 bg-cover bg-center shadow-lg"
                                            style={{ backgroundImage: `url('https://i.pravatar.cc/80?img=${i + 10}')` }}
                                        />
                                    ))}
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0d1f5c] bg-[#d4940a] text-[10px] font-bold text-white shadow-lg z-10">
                                        +2M
                                    </div>
                                </div>
                                <div className="pl-1">
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-[#d4940a] text-[#d4940a]" />)}
                                        <span className="ml-1.5 text-sm font-bold text-white">4.9/5</span>
                                    </div>
                                    <p className="text-sm text-white/60">Trusted by 2 Million+ Students</p>
                                </div>
                            </div>
                        </motion.div>
                        

                        {/* RIGHT COLUMN — Animated Feature Cards */}
                        <div className="hidden lg:flex flex-col gap-6 pl-12 justify-center h-full">
                            {/* Quality Education Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
                                className="bg-white border-2 border-transparent hover:border-[#d4940a] hover:bg-[#e8a020] rounded-2xl p-5 shadow-lg flex items-center gap-5 transform transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl cursor-default"
                            >
                                <div className="w-14 h-14 rounded-xl bg-[#0d1f5c]/5 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <Award className="h-7 w-7 text-[#0d1f5c] transition-colors" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[#0d1f5c] transition-colors mb-1">Quality Education</p>
                                    <p className="text-[13px] font-medium text-gray-400 group-hover:text-[#0d1f5c]/70 transition-colors">Learn from experienced mentors</p>
                                </div>
                            </motion.div>

                            {/* Access Anywhere Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
                                className="bg-white border-2 border-transparent hover:border-[#d4940a] hover:bg-[#e8a020] rounded-2xl p-5 shadow-lg flex items-center gap-5 transform transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl cursor-default ml-8"
                            >
                                <div className="w-14 h-14 rounded-xl bg-[#0d1f5c]/5 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <Target className="h-7 w-7 text-[#0d1f5c] transition-colors" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[#0d1f5c] transition-colors mb-1">Learn Anywhere</p>
                                    <p className="text-[13px] font-medium text-gray-400 group-hover:text-[#0d1f5c]/70 transition-colors">Access from any device seamlessly</p>
                                </div>
                            </motion.div>

                            {/* Expert Mentorship Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
                                className="bg-white border-2 border-transparent hover:border-[#d4940a] hover:bg-[#e8a020] rounded-2xl p-5 shadow-lg flex items-center gap-5 transform transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl cursor-default ml-16"
                            >
                                <div className="w-14 h-14 rounded-xl bg-[#0d1f5c]/5 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <Users className="h-7 w-7 text-[#0d1f5c] transition-colors" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[#0d1f5c] transition-colors mb-1">Expert Mentorship</p>
                                    <p className="text-[13px] font-medium text-gray-400 group-hover:text-[#0d1f5c]/70 transition-colors">Guidance from vetted professionals</p>
                                </div>
                            </motion.div>

                            {/* Structured Curriculum Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.4 }}
                                className="bg-white border-2 border-transparent hover:border-[#d4940a] hover:bg-[#e8a020] rounded-2xl p-5 shadow-lg flex items-center gap-5 transform transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl cursor-default ml-24"
                            >
                                <div className="w-14 h-14 rounded-xl bg-[#0d1f5c]/5 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <BookOpen className="h-7 w-7 text-[#0d1f5c] transition-colors" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[#0d1f5c] transition-colors mb-1">Structured Syllabus</p>
                                    <p className="text-[13px] font-medium text-gray-400 group-hover:text-[#0d1f5c]/70 transition-colors">Guided paths for complete learning</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────────────────────
                STATS BAR — #d4940a
            ──────────────────────────────────────────────── */}
            <section className="py-16 bg-[#d4940a]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-center md:divide-x md:divide-[#0d1f5c]/20">
                        {[
                            { value: "50,000+", label: "Students" },
                            { value: "200+", label: "Mentors" },
                            { value: "98%", label: "Placement Rate" },
                            { value: "4.9/5", label: "Rating" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center px-10 py-4 md:py-0 w-full md:w-auto"
                            >
                                <div className="text-4xl font-black text-[#0d1f5c]">
                                    {stat.value}
                                </div>
                                <div className="text-[#0d1f5c]/80 font-bold text-sm mt-2">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* ────────────────────────────────────────────────
                WHY CHOOSE US — white with bottom border
            ──────────────────────────────────────────────── */}
            <section className="py-20 bg-white border-b border-[#e8ecf4]">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto mb-16"
                    >
                        <span className="inline-block px-3 py-1 bg-[#d4940a]/10 text-[#d4940a] text-xs font-bold rounded mb-4 tracking-widest uppercase">
                            Why Choose Us
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-[#0d1f5c] mb-4">
                            Learn Without Limits
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Experience education like never before with our cutting-edge platform
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Video, title: "Live Interactive Classes", desc: "Real-time sessions with expert mentors. Ask questions and get instant answers in every class." },
                            { icon: MessageCircle, title: "24/7 Doubt Solving", desc: "Stuck on a problem? Our mentors are available round the clock to clear your doubts." },
                            { icon: FileText, title: "Comprehensive Study Material", desc: "Access thousands of video lectures, notes, and practice questions curated by experts." },
                            { icon: Target, title: "Personalized Learning Path", desc: "AI-powered recommendations to help you focus on areas that need improvement." },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: idx < 2 ? -100 : 100 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: (idx % 2) * 0.1, type: "spring", stiffness: 50 }}
                                viewport={{ once: true }}
                                className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:bg-[#1a2456] transition-all duration-500 group cursor-pointer"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#0d1f5c]/5 flex items-center justify-center mb-6 group-hover:bg-[#d4940a] transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110">
                                    <item.icon className="h-8 w-8 text-[#0d1f5c] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-black text-[#1a2456] mb-3 group-hover:!text-[#d4940a] transition-colors duration-300">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm group-hover:text-white/90 transition-colors duration-300">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────────────────────
                HOW IT WORKS
            ──────────────────────────────────────────────── */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <span className="inline-block px-4 py-1.5 bg-[#d4940a]/10 text-[#d4940a] text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
                            How It Works
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-[#0d1f5c]">
                            Start Learning in 3 Easy Steps
                        </h2>
                    </motion.div>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Connecting Line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[1px] bg-[#dde3f0] z-0 origin-left"
                        ></motion.div>

                        <div className="grid md:grid-cols-3 gap-12 relative z-10">
                            {/* Step 1 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center text-center group"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: -5 }}
                                    className="w-20 h-20 rounded-3xl bg-[#0d1f5c] flex items-center justify-center mb-6 shadow-xl shadow-[#0d1f5c]/10 relative border-2 border-white cursor-pointer"
                                >
                                    <Users className="h-8 w-8 text-[#d4940a]" />
                                </motion.div>
                                <div className="text-6xl md:text-7xl font-black text-[#f0f3fa] mb-2 leading-none select-none">
                                    01
                                </div>
                                <h3 className="text-xl font-bold text-[#d4940a] mb-3 group-hover:text-[#e8a020] transition-colors">Sign Up Free</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                    Create your account in seconds with just your phone number. No fees, no hidden charges.
                                </p>
                            </motion.div>

                            {/* Step 2 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center text-center group"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="w-20 h-20 rounded-3xl bg-[#0d1f5c] flex items-center justify-center mb-6 shadow-xl shadow-[#0d1f5c]/10 relative border-2 border-white cursor-pointer"
                                >
                                    <BookOpen className="h-8 w-8 text-[#d4940a]" />
                                </motion.div>
                                <div className="text-6xl md:text-7xl font-black text-[#f0f3fa] mb-2 leading-none select-none">
                                    02
                                </div>
                                <h3 className="text-xl font-bold text-[#d4940a] mb-3 group-hover:text-[#e8a020] transition-colors">Choose Your Course</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                    Browse through 500+ courses across JEE, NEET, UPSC, Coding, and more.
                                </p>
                            </motion.div>

                            {/* Step 3 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center text-center group"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: -5 }}
                                    className="w-20 h-20 rounded-3xl bg-[#0d1f5c] flex items-center justify-center mb-6 shadow-xl shadow-[#0d1f5c]/10 relative border-2 border-white cursor-pointer"
                                >
                                    <TrendingUp className="h-8 w-8 text-[#d4940a]" />
                                </motion.div>
                                <div className="text-6xl md:text-7xl font-black text-[#f0f3fa] mb-2 leading-none select-none">
                                    03
                                </div>
                                <h3 className="text-xl font-bold text-[#d4940a] mb-3 group-hover:text-[#e8a020] transition-colors">Learn & Grow</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                    Attend live classes, complete assignments, and track your progress to success.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────────────────────
                POPULAR COURSES — #f0f3fa  
            ──────────────────────────────────────────────── */}
            <section className="py-20 bg-[#f0f3fa]">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto mb-16"
                    >
                        <span className="inline-block px-3 py-1 bg-[#d4940a]/10 text-[#d4940a] text-xs font-bold rounded mb-4 tracking-widest uppercase">
                            Popular Courses
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-[#0d1f5c] mb-4">
                            Explore Our Top Courses
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Industry-leading courses designed by expert mentors to help you succeed
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Complete JEE Main & Advanced Physics", category: "JEE", students: "15,000+", rating: 4.9, price: "\u20B94,999", originalPrice: "\u20B912,999", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&h=400&fit=crop", level: "Advanced" },
                            { title: "NEET Biology Complete Course", category: "NEET", students: "22,000+", rating: 4.8, price: "\u20B95,499", originalPrice: "\u20B914,999", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop", level: "Intermediate" },
                            { title: "Full Stack Web Development Bootcamp", category: "Coding", students: "18,500+", rating: 4.9, price: "\u20B96,999", originalPrice: "\u20B919,999", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop", level: "Beginner" },
                        ].map((course, idx) => (
                            <Link href="/courses" key={idx}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -6 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-[#dde3f0] transition-all duration-300 flex flex-col cursor-pointer h-full"
                            >
                                <div className="relative h-52 overflow-hidden">
                                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1.5 bg-[#d4940a] rounded-lg text-xs font-black text-white uppercase tracking-wider shadow-md">{course.category}</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">{course.level}</span>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="h-4 w-4 text-[#d4940a] fill-[#d4940a]" />
                                            <span className="text-sm font-bold text-white">{course.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-black text-[#d4940a] mb-4 line-clamp-2 leading-snug">{course.title}</h3>

                                    <div className="flex items-center gap-5 text-sm text-gray-500 mb-6 font-medium">
                                        <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-[#d4940a]" /><span>{course.students}</span></div>
                                        <div className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-[#d4940a]" /><span>50+ Lessons</span></div>
                                    </div>

                                    <div className="mt-auto" />

                                    <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                                        <div>
                                            <span className="text-2xl font-black text-[#0d1f5c]">{course.price}</span>
                                            <span className="text-sm font-bold text-gray-400 line-through ml-2">{course.originalPrice}</span>
                                        </div>
                                        <span className="text-sm font-bold text-[#d4940a] flex items-center gap-1">View Course <ArrowRight className="h-4 w-4" /></span>
                                    </div>
                                </div>
                            </motion.div>
                            </Link>
                        ))}
                    </div>

                    {/* Explore All Courses CTA */}
                    <div className="text-center mt-12">
                        <Link href="/courses">
                            <Button size="lg" className="bg-[#0d1f5c] hover:bg-[#1a2747] text-white rounded-xl h-13 px-10 text-base font-bold shadow-md">
                                Explore All Courses <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────────────────────
                TESTIMONIALS — dark navy #0d1f5c
            ──────────────────────────────────────────────── */}
            <section className="py-20 bg-[#0d1f5c]">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 bg-[#d4940a]/10 text-[#d4940a] text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
                            What Our Students Say
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: '#e8a020' }}>
                            Testimonials
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Priya Sharma", role: "JEE Advanced — AIR 342", image: "https://i.pravatar.cc/150?img=32", quote: "LiveMentorHub completely changed the way I prepared for JEE. The live classes and instant doubt solving helped me crack AIR 342. The mentors here are truly world-class." },
                            { name: "Arjun Patel", role: "NEET 2025 — 680/720", image: "https://i.pravatar.cc/150?img=33", quote: "The structured study plan and daily live classes kept me consistent throughout my preparation. I never thought I could score 680+ in NEET. Thank you LiveMentorHub!" },
                            { name: "Sneha Reddy", role: "Full Stack Developer at Google", image: "https://i.pravatar.cc/150?img=44", quote: "The coding bootcamp was incredibly well-structured. From zero coding knowledge to landing a job at Google in 8 months. The project-based learning approach is fantastic." },
                        ].map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-8"
                            >
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-[#d4940a] fill-[#d4940a]" />
                                    ))}
                                </div>
                                <p className="mb-8 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                                    <img src={t.image} alt={t.name} className="h-12 w-12 rounded-full object-cover border-2 border-[#d4940a]" />
                                    <div>
                                        <h4 className="font-bold text-base" style={{ color: '#e8a020' }}>{t.name}</h4>
                                        <p className="text-sm font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────────────────────
                DOWNLOAD APP — light grey background
            ──────────────────────────────────────────────── */}
            <section className="py-24 bg-[#f8fafc] relative overflow-hidden">
                <div className="container max-w-6xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        {/* Left Column: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-[#e8a020]/10 text-[#e8a020] text-xs font-bold rounded-full mb-6 tracking-widest uppercase">
                                    Learning on the Go
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-[#0d1f5c] leading-[1.1] mb-6">
                                    Get the <div className="inline-block w-12 h-10 bg-white rounded-lg align-middle mx-1 overflow-hidden relative shadow-sm border border-gray-100"><Image src="/logo.png" alt="LiveMentorHub" width={120} height={120} className="w-full h-full object-contain scale-[1.7]" unoptimized /></div> Hub App
                                </h2>
                                <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
                                    Everything you need for your learning journey is now at your fingertips. Access live doubt solving, interactive classes, and seamless material downloads from your smartphone.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-8 text-[#0d1f5c]">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#e8a020]/10 flex items-center justify-center">
                                        <BadgeCheck className="h-4 w-4 text-[#e8a020]" />
                                    </div>
                                    <span className="font-bold">4.8 Rating</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#e8a020]/10 flex items-center justify-center">
                                        <BadgeCheck className="h-4 w-4 text-[#e8a020]" />
                                    </div>
                                    <span className="font-bold">10M+ Downloads</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button className="bg-[#0d1f5c] hover:bg-[#1a2747] text-white rounded-xl px-7 py-3.5 flex items-center gap-3 transition-all cursor-pointer group shadow-lg">
                                    <div className="text-white text-left">
                                        <p className="text-[10px] uppercase font-bold text-white/50 leading-none mb-0.5">Download on the</p>
                                        <p className="text-lg font-bold leading-none">App Store</p>
                                    </div>
                                </button>
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.app.livementorhub&pcampaignid=web_share"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#0d1f5c] hover:bg-[#1a2747] text-white rounded-xl px-7 py-3.5 flex items-center gap-3 transition-all cursor-pointer group shadow-lg"
                                >
                                    <div className="text-white text-left">
                                        <p className="text-[10px] uppercase font-bold text-white/50 leading-none mb-0.5">Get it on</p>
                                        <p className="text-lg font-bold leading-none">Google Play</p>
                                    </div>
                                </a>
                            </div>
                        </motion.div>

                        {/* Right Column: Phone Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="flex justify-center lg:justify-end"
                        >
                            <div className="relative">
                                {/* Subtle glowing effect behind phone */}
                                <div className="absolute inset-x-0 inset-y-0 bg-[#e8a020]/5 blur-[80px] rounded-full scale-110" />

                                {/* Phone Frame */}
                                <div className="relative w-[280px] h-[580px] md:w-[300px] md:h-[620px] bg-[#0d1f5c] rounded-[3.5rem] border-[8px] border-white shadow-2xl overflow-hidden">
                                    {/* Speaker/Camera notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#0d1f5c] rounded-b-2xl z-50 flex items-center justify-center gap-2">
                                        <div className="w-8 h-1 bg-white/10 rounded-full" />
                                        <div className="w-2 h-2 bg-white/10 rounded-full" />
                                    </div>

                                    {/* The App Image */}
                                    <div className="absolute inset-0 pt-2 px-1 pb-1">
                                        <div className="w-full h-full rounded-[2.8rem] overflow-hidden bg-white">
                                            <Image
                                                src="/app-final.jpeg"
                                                alt="App Preview"
                                                width={400}
                                                height={800}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -right-10 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden md:block z-30"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">App Ranking</p>
                                            <p className="text-sm font-black text-[#0d1f5c]">Top #1 Hub</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────────────────────
                FAQ — white
            ──────────────────────────────────────────────── */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 bg-[#d4940a]/10 text-[#d4940a] text-xs font-bold rounded-full mb-4 tracking-widest uppercase">FAQ</span>
                        <h2 className="text-3xl md:text-5xl font-black text-[#0d1f5c] mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-500 text-lg">Got questions? We&apos;ve got answers!</p>
                    </motion.div>

                    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-4">
                        <FAQItem question="What is LiveMentorHub?" answer="LiveMentorHub is India's leading online learning platform that connects students with expert mentors for live interactive classes, doubt solving, and personalized learning paths for exams like JEE, NEET, UPSC, and more." />
                        <FAQItem question="Are the classes live or recorded?" answer="We offer both! Our platform features 100+ daily live classes where you can interact with teachers in real-time, plus thousands of recorded lectures that you can access anytime, anywhere." />
                        <FAQItem question="Is the registration free?" answer="Yes! Registration on LiveMentorHub is completely free. You only pay when you enroll in a course. We also offer free trial classes for all our courses." />
                        <FAQItem question="Can I get doubt solving support?" answer="Absolutely! Our mentors are available 24/7 for doubt solving. You can ask questions during live classes, use our doubt forum, or book one-on-one sessions with mentors." />
                        <FAQItem question="Do you provide certificates?" answer="Yes, upon successful completion of any course, you will receive a certificate that can be shared on LinkedIn and other professional platforms." />
                        <FAQItem question="What courses do you offer?" answer="We offer courses for JEE Main & Advanced, NEET, UPSC Civil Services, GATE, Coding & Web Development, School Education (Class 6-12), and many more competitive exams." />
                    </div>
                </div>
            </section>


            {/* ────────────────────────────────────────────────
                CTA BANNER — gold #d4940a
            ──────────────────────────────────────────────── */}
            <section className="py-20 bg-[#d4940a]">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto space-y-6"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-[#0d1f5c] tracking-tight">
                            Ready to Start Your Learning Journey?
                        </h2>
                        <p className="text-lg font-medium" style={{ color: 'rgba(13,31,92,0.7)' }}>
                            Join 2 Million+ students who are already learning from India&apos;s best mentors. Start your free account today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <Link href="/student/auth/signup">
                                <Button size="lg" className="bg-[#0d1f5c] hover:bg-[#0a1540] text-white rounded-xl h-14 px-10 text-lg font-bold shadow-lg">
                                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/student/courses">
                                <Button variant="outline" size="lg" className="bg-white hover:bg-gray-50 border-0 text-[#0d1f5c] rounded-xl h-14 px-10 text-lg font-bold shadow-lg">
                                    Browse Courses
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
