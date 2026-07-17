"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Clock, Star, Users, ChevronLeft, BarChart2, BookOpen,
    GraduationCap, Calendar, ShieldAlert, Loader2, Video,
    FileText, Lock, CheckCircle, ChevronDown, ChevronUp, Trophy,
    ShieldCheck, Globe, PlayCircle, Award, Target, MessageCircle,
    Download, Eye
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnrollmentModal } from "@/components/courses/EnrollmentModal";
import { getCourseById, isEnrolledIn, useCoursePageData, fetchCourseContent, type CourseContent, type CourseContentType } from "@/lib/courseData";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/layout/Footer";
import { SyllabusSection } from './SyllabusSection';
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw?: string) {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function SectionHeading({ title, icon: Icon }: { title: string, icon?: any }) {
    return (
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            {Icon && <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center"><Icon size={20} className="text-[#0d1f5c]" /></div>}
            <h2 className="text-2xl font-bold text-[#0d1f5c] tracking-tight">{title}</h2>
        </div>
    );
}

function SidebarField({ label, value, icon: Icon }: { label: string; value?: string | number; icon: any }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group">
            <div className="flex items-center gap-3 text-gray-500 group-hover:text-[#0d1f5c] transition-colors">
                <Icon size={16} className="text-[#d4940a]" />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-sm font-semibold text-[#0d1f5c] text-right">{value}</span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = typeof params?.courseId === "string" ? params.courseId : "";
    const { isAuthenticated, user } = useAuth();

    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const [openModules, setOpenModules] = useState<number[]>([0]);
    const [studentId, setStudentId] = useState<string | undefined>(undefined);
    const [country, setCountry] = useState<string | undefined>(undefined);
    const [activeContentType, setActiveContentType] = useState<'ALL' | 'NOTES' | 'IMAGE' | 'RECORDED_VIDEO'>('ALL');
    const [content, setContent] = useState<CourseContent[]>([]);
    const [contentLoading, setContentLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    useEffect(() => {
        setStudentId(user?.studentId || "demo");
        setCountry(user?.country || localStorage.getItem("country") || undefined);
    }, [user]);

    const { loading: coursesLoading } = useCoursePageData(studentId, country);
    const course = getCourseById(courseId);

    const getViewUrl = (url: string, type: string) => {
        if (!url) return "#";
        if (type === 'NOTES') {
            return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        }
        return url;
    };

    const isEnrolled = isAuthenticated ? isEnrolledIn(courseId) : false;

    // Fetch content when enrolled, studentId/course ready
    useEffect(() => {
        if (!isEnrolled || !studentId || !course) {
            setContent([]);
            return;
        }

        const fetchContent = async () => {
            setContentLoading(true);
            try {
                const data = await fetchCourseContent(studentId, course.id, activeContentType === 'ALL' ? undefined : activeContentType as CourseContentType);
                setContent(data);
            } catch (e) {
                console.error('Content fetch error:', e);
                setContent([]);
            } finally {
                setContentLoading(false);
            }
        };

        fetchContent();
    }, [isEnrolled, studentId, course?.id, activeContentType]);

  

    const toggleModule = (idx: number) =>
        setOpenModules(prev => prev.includes(idx) ? prev.filter(m => m !== idx) : [...prev, idx]);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (coursesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="h-16 w-16 rounded-2xl bg-[#0d1f5c] flex items-center justify-center shadow-lg"
                    >
                        <Loader2 size={28} className="text-[#d4940a] animate-spin" />
                    </motion.div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                        Preparing details...
                    </p>
                </div>
            </div>
        );
    }

    // ── Not found ──────────────────────────────────────────────────────────────
    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
                <div className="max-w-md w-full text-center space-y-6 bg-white p-12 rounded-[2rem] shadow-xl border border-gray-100">
                    <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert size={40} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#0d1f5c] mb-3">Course Unavailable</h2>
                        <p className="text-gray-500 leading-relaxed">The requested course might have been archived or is no longer accessible to the public.</p>
                    </div>
                    <Button
                        onClick={() => router.push("/courses")}
                        className="w-full h-14 rounded-xl bg-[#0d1f5c] text-white font-semibold text-base hover:bg-[#d4940a] transition-all"
                    >
                        Return to Library
                    </Button>
                </div>
            </div>
        );
    }

    const discount = course.originalPrice > course.price
        ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
        : 0;

    const hasCurriculum = course.curriculum && course.curriculum.length > 0;

    return (
        <div className="bg-[#f8f9fa] min-h-screen flex flex-col font-sans selection:bg-[#d4940a] selection:text-white">

            {/* ── Top Nav ────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 transition-all">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button
                        onClick={() => router.push("/courses")}
                        className="h-10 w-10 rounded-full bg-gray-100 border border-transparent hover:border-gray-200 flex items-center justify-center text-[#0d1f5c] transition-all group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="text-sm font-semibold text-gray-400">
                        <span className="hover:text-[#0d1f5c] cursor-pointer" onClick={() => router.push('/courses')}>Courses</span>
                        <span className="mx-2">/</span>
                        <span className="text-[#0d1f5c]">{course.subject || 'Details'}</span>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section (Elegant & Demure) ───────────────────────────── */}
            <header className="pt-28 pb-32 bg-[#0d1f5c] relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4940a]/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                {course.courseType && (
                                    <span className="px-3 py-1 bg-[#d4940a] text-[#0d1f5c] text-[10px] font-bold uppercase tracking-widest rounded-md">
                                        {course.courseType}
                                    </span>
                                )}
                                {course.difficulty && (
                                    <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-md backdrop-blur-sm">
                                        {course.difficulty}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight" style={{ color: '#d4940a' }}>
                                {course.title}
                            </h1>

                            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-2xl">
                                {course.description ? (
                                    course.description.length > 150 ? `${course.description.substring(0, 150)}...` : course.description
                                ) : (
                                    "A comprehensive academic journey designed to deliver measurable mastery in the subject matter."
                                )}
                            </p>

                            <div className="flex items-center gap-8 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                                        <Users size={20} className="text-[#d4940a]" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg">{course.students >= 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students}</p>
                                        <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase">Learners</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                                        <Star size={20} className="text-[#d4940a] fill-[#d4940a]" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg">{course.rating > 0 ? course.rating : "New"}</p>
                                        <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase">Rating</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-5 hidden lg:block">
                        {/* Empty space for the floating sticky sidebar to land */}
                    </div>
                </div>
            </header>

            {/* ── Main Content Layout ────────────────────────────────────────── */}
            <main className="max-w-7xl mx-auto px-6 pb-24 w-full flex flex-col lg:flex-row gap-12 relative -mt-16 z-20">

                {/* Left Column (Content) */}
                <div className="flex-1 space-y-12 min-w-0">

                    {/* Video/Image Presenter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-full aspect-video rounded-3xl overflow-hidden bg-gray-900 shadow-2xl relative group"
                    >
                        {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen size={48} className="text-white/10" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all text-white hover:text-[#0d1f5c]">
                                <PlayCircle size={40} className="ml-1" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Description Section */}
                    {course.description && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 lg:p-10 rounded-[2rem] border border-gray-100 shadow-sm"
                        >
                            <SectionHeading title="About This Course" icon={BookOpen} />
                            
                            <div className="prose prose-lg prose-slate max-w-none text-gray-600 leading-relaxed font-light">
                                <p>{course.description}</p>
                            </div>
<SyllabusSection courseId={courseId} />
                        </motion.section>
                    )}

                    {/* Details Overview section to re-iterate key features elegantly */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-8 lg:p-10 rounded-[2rem] border border-gray-100 shadow-sm"
                    >
                        <SectionHeading title="Course Breakdown" icon={Target} />
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { title: "Level", desc: course.difficulty || "Beginner", icon: BarChart2 },
                                { title: "Language", desc: course.medium || "English", icon: Globe },
                                { title: "Format", desc: course.courseType || "Academic", icon: GraduationCap },
                                { title: "Completion", desc: "Certificate upon grading", icon: Award }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="mt-1 h-10 w-10 flex items-center justify-center bg-gray-50 rounded-lg text-[#d4940a]">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#d4940a]">{item.title}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Curriculum */}
                    {hasCurriculum && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-8 lg:p-10 rounded-[2rem] border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <FileText size={20} className="text-[#0d1f5c]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#0d1f5c] tracking-tight">Curriculum</h2>
                                </div>
                                <div className="text-sm font-semibold text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                                    {course.totalLessons || course.curriculum.length} Lessons • {course.duration || 'Flexible'}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {course.curriculum.map((lesson, idx) => (
                                    <div
                                        key={lesson.id}
                                        className="group p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md hover:border-[#d4940a]/30 transition-all flex items-center gap-4 cursor-pointer"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-[#d4940a]/10 group-hover:text-[#d4940a] transition-colors">
                                            {lesson.type === "video"
                                                ? <PlayCircle size={20} className="text-[#0d1f5c] group-hover:text-[#d4940a]" />
                                                : <FileText size={20} className="text-[#0d1f5c] group-hover:text-[#d4940a]" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-semibold text-[#0d1f5c] group-hover:text-[#d4940a] transition-colors">{lesson.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                {lesson.duration && (
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock size={12} /> {lesson.duration}
                                                    </span>
                                                )}
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium uppercase tracking-wider">
                                                    {lesson.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 p-2">
                                            {isEnrolled
                                                ? <CheckCircle size={20} className="text-emerald-500/50" />
                                                : <Lock size={16} className="text-gray-300" />
                                            }
                                        </div>
                                    </div>
                                ))}

                                {/* Course Materials - Only visible when enrolled */}
                                {isEnrolled && studentId && (
                                    <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
                                        {/* Content Type Filters */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                                            <button
                                                onClick={() => setActiveContentType("ALL")}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0",
                                                    activeContentType === "ALL"
                                                        ? "bg-[#0d1f5c] text-white shadow-md"
                                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:border-[#0d1f5c]/30"
                                                )}
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => setActiveContentType("NOTES")}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0",
                                                    activeContentType === "NOTES"
                                                        ? "bg-[#0d1f5c] text-white shadow-md"
                                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:border-[#0d1f5c]/30"
                                                )}
                                            >
                                                <Download className="h-3 w-3" /> Notes
                                            </button>
                                            <button
                                                onClick={() => setActiveContentType("IMAGE")}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0",
                                                    activeContentType === "IMAGE"
                                                        ? "bg-[#0d1f5c] text-white shadow-md"
                                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:border-[#0d1f5c]/30"
                                                )}
                                            >
                                                <FileText className="h-3 w-3" /> Images
                                            </button>
                                            <button
                                                onClick={() => setActiveContentType("RECORDED_VIDEO")}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0",
                                                    activeContentType === "RECORDED_VIDEO"
                                                        ? "bg-[#0d1f5c] text-white shadow-md"
                                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:border-[#0d1f5c]/30"
                                                )}
                                            >
                                                <Video className="h-3 w-3" /> Videos
                                            </button>
                                        </div>

                                        {/* Content List */}
                                        {contentLoading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-[#0d1f5c]" />
                                            </div>
                                        ) : content.length > 0 ? (
                                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                                {content.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 transition-all hover:shadow-md bg-white hover:border-[#d4940a]/30"
                                                    >
                                                        {/* Icon based on content type */}
                                                        <div className={cn(
                                                            "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                                                            item.contentType === 'NOTES' ? "bg-amber-50 text-amber-600" :
                                                            item.contentType === 'IMAGE' ? "bg-blue-50 text-blue-600" :
                                                            "bg-indigo-50 text-indigo-600"
                                                        )}>
                                                            {item.contentType === 'NOTES' ? <Download className="h-6 w-6" /> :
                                                             item.contentType === 'IMAGE' ? <FileText className="h-6 w-6" /> :
                                                             <Video className="h-6 w-6" />}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-[#0d1f5c] text-sm truncate group-hover:text-[#d4940a]">{item.title}</h4>
                                                            <p className="text-xs text-gray-500 truncate">{item.description || item.teacherName}</p>
                                                        </div>

                                                        {/* Download/View Button */}
                                                        <div className="flex gap-2">
                                                            {item.contentType === 'RECORDED_VIDEO' ? (
                                                                <button
                                                                    onClick={() => setSelectedVideo(item.contentUrl)}
                                                                    className="shrink-0 h-10 px-4 rounded-lg bg-[#0d1f5c] text-white flex items-center justify-center text-sm font-medium hover:bg-[#d4940a] transition-all shadow-sm"
                                                                >
                                                                    <PlayCircle className="h-4 w-4 mr-1" />
                                                                    Watch
                                                                </button>
                                                            ) : (
                                                                <a
                                                                    href={getViewUrl(item.contentUrl, item.contentType)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="shrink-0 h-10 px-4 rounded-lg bg-indigo-100 text-[#0d1f5c] flex items-center justify-center text-sm font-medium hover:bg-indigo-200 transition-all shadow-sm"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </a>
                                                            )}
                                                            <a
                                                                href={item.contentUrl}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="shrink-0 h-10 px-4 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-medium hover:bg-gray-200 transition-all shadow-sm"
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                Download
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No {activeContentType === "ALL" ? "content" : activeContentType.toLowerCase().replace('_', ' ')} available
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )}
                    
                </div>

                {/* Right Column (Sticky Sidebar) */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="lg:sticky lg:top-24 space-y-6">

                        {/* Pricing & Intent Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden"
                        >
                            {!isEnrolled ? (
                                <div className="p-8">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl font-bold text-[#0d1f5c]">
                                            {course.currencySymbol}{course.price.toLocaleString()}
                                        </span>
                                        {discount > 0 && (
                                            <span className="text-sm text-gray-400 line-through font-medium">
                                                {course.currencySymbol}{course.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {discount > 0 && (
                                        <div className="mb-6 inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm font-bold">
                                            <Clock size={14} /> {discount}% Discount Active
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                router.push('/auth/login');
                                                return;
                                            }
                                            setIsEnrollmentOpen(true);
                                        }}
                                        className="w-full h-14 rounded-xl bg-[#0d1f5c] text-white font-semibold text-[15px] hover:bg-[#d4940a] hover:text-white transition-colors tracking-wide mb-4 shadow-md"
                                    >
                                        Enroll Now
                                    </Button>

                                    <p className="text-center text-xs text-gray-400 font-medium tracking-wide">Secure transaction via LMS</p>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-[#0d1f5c] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 blur-[40px] rounded-full" />
                                    <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                        <Trophy size={32} className="text-[#d4940a]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">You're Enrolled</h3>
                                    <p className="text-sm text-white/70 mb-8 font-light">Continue mastering your skills from the dashboard.</p>

                                    <Button
                                        onClick={() => router.push("/dashboard")}
                                        className="w-full h-14 rounded-xl bg-[#d4940a] text-[#0d1f5c] font-bold text-[15px] hover:bg-white transition-colors"
                                    >
                                        Go to Application
                                    </Button>
                                </div>
                            )}

                            <div className="bg-gray-50 p-6 border-t border-gray-100">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Course Metrics</h4>
                                <div className="px-2">
                                    <SidebarField label="Total Lessons" value={course.totalLessons ? `${course.totalLessons} Lessons` : course.curriculum?.length ? `${course.curriculum.length} Lessons` : undefined} icon={FileText} />
                                    <SidebarField label="Total Duration" value={course.duration} icon={Clock} />
                                    <SidebarField label="Difficulty Level" value={course.difficulty || 'Beginner'} icon={BarChart2} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Metadata Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8"
                        >
                            <h4 className="text-sm font-bold text-[#0d1f5c] mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                                <ShieldCheck size={18} className="text-[#d4940a]" /> Academic Profile
                            </h4>
                            <div className="space-y-1">
                                <SidebarField label="Education Board" value={course.board} icon={Award} />
                                <SidebarField label="Class Level" value={course.classname} icon={GraduationCap} />
                                <SidebarField label="Core Subject" value={course.subject} icon={BookOpen} />
                                <SidebarField label="Stream" value={course.stream} icon={Target} />
                                <SidebarField label="Sub-category" value={course.subcategory} icon={Target} />
                            </div>
                        </motion.div>

                        {/* Schedule Card (If present) */}
                        {(course.courseStartDate || course.courseEndDate) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8"
                            >
                                <h4 className="text-sm font-bold text-[#0d1f5c] mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                                    <Calendar size={18} className="text-[#d4940a]" /> Course Schedule
                                </h4>
                                <div className="space-y-1">
                                    <SidebarField label="Commences" value={formatDate(course.courseStartDate)} icon={Clock} />
                                    <SidebarField label="Concludes" value={formatDate(course.courseEndDate)} icon={CheckCircle} />
                                </div>
                            </motion.div>
                        )}

                        {/* Support mini-card */}
                        <div className="text-center px-4">
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                Content organized by <span className="text-[#0d1f5c] font-bold">Live Mentor Hub</span>. Complete syllabus access upon enrollment.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <EnrollmentModal
                isOpen={isEnrollmentOpen}
                onClose={() => setIsEnrollmentOpen(false)}
                courseCode={course.id}
                price={course.price}
                courseTitle={course.title}
                currencySymbol={course.currencySymbol || "₹"}
                originalPrice={course.originalPrice}
            />

            {/* Video Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedVideo(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl group"
                            onClick={(e) => e.stopPropagation()}
                            onContextMenu={(e) => e.preventDefault()} // Disable right click
                        >
                            {/* Watermark to discourage screen recording */}
                            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-10">
                                <span className="text-white text-4xl font-bold transform -rotate-45">
                                    {user?.name || user?.email || "LiveMentorHub"}
                                </span>
                            </div>

                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            
                            <video
                                src={`${API_BASE}/api/notes/stream?url=${encodeURIComponent(selectedVideo)}`}
                                controls
                                autoPlay
                                className="w-full aspect-video outline-none relative z-10"
                                controlsList="nodownload"
                                disablePictureInPicture
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: "blur(0px)" }}
                                onPause={(e) => {
                                    // Slight blur when paused to prevent easy screenshotting of static frames
                                    (e.target as HTMLVideoElement).style.filter = "blur(5px)";
                                }}
                                onPlay={(e) => {
                                    (e.target as HTMLVideoElement).style.filter = "blur(0px)";
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
