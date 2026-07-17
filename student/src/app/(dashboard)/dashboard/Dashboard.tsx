"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardCarousel } from "@/components/dashboard/DashboardCarousel";
import CourseProgressList from "@/components/dashboard/CourseProgressList";
import { ClassCategoryList } from "@/components/dashboard/ClassCategoryList";
import {
    PlayCircle, FileText, HelpCircle, BarChart2, PenTool,
    ArrowRight, Info, Calendar, BookOpen, Clock, ChevronRight
} from "lucide-react";

type FilterType = "all" | "academic" | "non-academic";

export default function DashboardPage() {
    const { isAuthenticated, user } = useAuth();

    const [homeData, setHomeData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

    const router = useRouter();

    const QUICK_ACTIONS = [
        { label: "Live Classes", desc: "Join daily interactive sessions", icon: PlayCircle, color: "text-red-500", bg: "bg-red-50", href: "/live" },
        { label: "Assignments", desc: "Complete pending tasks", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", href: "/assignments" },
        { label: "Doubt Solving", desc: "Connect with experts 24/7", icon: HelpCircle, color: "text-orange-500", bg: "bg-orange-50", href: "/doubt" },
        { label: "Test Series", desc: "Evaluate your prep level", icon: PenTool, color: "text-purple-600", bg: "bg-purple-50", href: "/tests" },
        { label: "My Progress", desc: "View detailed analytics", icon: BarChart2, color: "text-emerald-600", bg: "bg-emerald-50", href: "/progress" },
    ];

    const getCourseType = () => {
        if (selectedFilter === "all") return undefined;
        return selectedFilter;
    };

    const showClassCategory = selectedFilter !== "non-academic";

    const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
        { label: "All Courses", value: "all" },
        { label: "Academic", value: "academic" },
        { label: "Non-Academic", value: "non-academic" },
    ];

    // Helper to get first name
    const firstName = user?.name ? user.name.split(" ")[0] : "Student";

    return (
        <div className="space-y-10 pb-16 font-sans">
            {/* Guest Access Banner */}
            {!isAuthenticated && (
                <div className="bg-[#fff8e6] border border-[#f5d070] rounded-xl px-4 py-3 flex items-center gap-3">
                    <Info className="h-5 w-5 text-[#d4940a] flex-shrink-0" />
                    <p className="text-sm text-[#5c4a16]">
                        You are viewing the platform in <strong>Guest Mode</strong>.{" "}
                        <Link href="/auth/login" className="text-[#0d1f5c] font-semibold hover:underline decoration-2 underline-offset-2">
                            Log in
                        </Link>{" "}
                        to access your enrolled classes and personalized tracking.
                    </p>
                </div>
            )}

            {/* ── WELCOME SECTION (Clean, EdTech Style) ── */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl md:text-[34px] font-extrabold text-[#0d1f5c] tracking-tight">
                        Hi, {firstName}!
                    </h1>
                    <p className="text-gray-600 font-medium mt-1.5 text-[15px]">
                        What would you like to learn today?
                    </p>
                </div>
                
            </section>

            {/* ── BANNER / CAROUSEL ── */}
            <section>
                <DashboardCarousel />
            </section>

            {/* ── HIGH-PRIORITY QUICK ACTIONS (Clean Grid) ── */}
            <section>
                <h2 className="text-xl font-bold text-[#0d1f5c] mb-6">Quick Access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    {QUICK_ACTIONS.map((action) => (
                        <Link key={action.label} href={action.href} className="group">
                            <div className="h-full bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-1">
                                {/* Invisible accent line at top */}
                                <div className={`absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-current ${action.color.replace('text-', 'bg-')}`} />
                                
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 relative`}>
                                        <action.icon className="h-7 w-7 stroke-[2]" />
                                        {/* Subtle colored glow behind icon */}
                                        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 blur-md transition-opacity ${action.color.replace('text-', 'bg-')}`} />
                                    </div>
                                    <div className="p-2 rounded-full bg-gray-50 group-hover:bg-[#d4940a]/10 transition-colors">
                                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#d4940a] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <h3 className="font-black text-[#0d1f5c] text-base leading-tight">
                                        {action.label}
                                    </h3>
                                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed group-hover:text-gray-600 transition-colors">
                                        {action.desc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── DYNAMIC COURSES SECTION ── */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-extrabold text-[#0d1f5c]">Recommended For You</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1.5">Curated courses based on your learning profile</p>
                    </div>

                    {/* Clean Pill Filters */}
                    <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                        {FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedFilter(opt.value)}
                                className={`px-5 py-2 rounded-md font-bold text-sm transition-all duration-200 ${
                                    selectedFilter === opt.value
                                        ? "bg-white text-[#0d1f5c] shadow-sm"
                                        : "text-gray-500 hover:text-[#0d1f5c]"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="-mx-2">
                    <CourseProgressList courseType={getCourseType()} />
                </div>
            </section>

            {/* ── BROWSE BY CATEGORY ── */}
            {showClassCategory && (
                <section className="pt-4">
                    <h2 className="text-xl font-bold text-[#0d1f5c] mb-5">Browse Subject Specifics</h2>
                    <ClassCategoryList />
                </section>
            )}
        </div>
    );
}
