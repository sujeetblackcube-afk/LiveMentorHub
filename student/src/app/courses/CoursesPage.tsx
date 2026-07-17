"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/Button";
import { Search, BookOpen, Layers, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/store/useAuth";
import { useCoursePageData } from "@/lib/courseData";

// const CATEGORIES = ["All", "JEE", "NEET", "UPSC", "GATE", "Coding", "MBA"];


export default function CoursesPage() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"all" | "my">("all");
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const studentId = isAuthenticated ? user?.studentId : undefined;
    const searchParams = useSearchParams();
    const isDemoMode = searchParams?.get("demo") === "true";

    const { courses, enrolledIds, myCourses, allCourses, loading, error, refetch } = useCoursePageData(studentId);
    const effectiveEnrolledIds = isDemoMode ? [] : enrolledIds;

    const subjectFilter = searchParams?.get("subject");
    const classFilter = searchParams?.get("class");

    // Use myCourses from API directly
    const displayCourses = activeTab === "all" ? courses : myCourses;

    const filteredCourses = displayCourses.filter(course => {
        // Search & Category Filters
        const matchesCategory = activeCategory === "All" || course.category === activeCategory;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Subject & Class Filters from URL
        const matchesSubject = !subjectFilter || course.subject?.toLowerCase() === subjectFilter.toLowerCase();
        const matchesClass = !classFilter || course.classname === classFilter;

        return matchesCategory && matchesSearch && matchesSubject && matchesClass;
    });

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#fafbfe] font-sans">
            {/* Glowing Accent Orbs (Scattered & Behind Grid) */}
            <div className="absolute top-0 right-0 z-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-[#d4940a]/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] left-[-10%] z-0 w-[400px] h-[400px] bg-[#0d1f5c]/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[20%] z-0 w-[600px] h-[600px] bg-[#0d1f5c]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[60%] left-[10%] z-0 w-[500px] h-[500px] bg-[#d4940a]/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Background Grid Pattern (Sits on top of the glow) */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0d1f5c20_1px,transparent_1px),linear-gradient(to_bottom,#0d1f5c20_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">

                    {/* Header & Tabs */}
                    {isDemoMode && (
                        <div className="mb-6 flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm text-indigo-700 backdrop-blur-sm bg-white/50">
                            <div>
                                <strong>Guest Mode active.</strong> You can browse course listings.
                            </div>
                            <Button onClick={() => router.push('/auth/login')} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow">
                                Login Now
                            </Button>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#0d1f5c] tracking-tight">
                                {activeTab === 'all' ? 'Explore Courses' : 'My Learning'}
                            </h1>
                            <p className="text-gray-500 mt-2 text-lg">
                                {activeTab === 'all' ? 'Discover new skills and reach your goals' : 'Continue where you left off'}
                            </p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm border border-gray-100 p-1.5 rounded-2xl inline-flex shadow-sm">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "all"
                                    ? "bg-[#0d1f5c] text-white shadow-md transform scale-105"
                                    : "text-gray-500 hover:text-[#0d1f5c] hover:bg-white/80"
                                    }`}
                            >
                                <BookOpen className="h-4 w-4" />
                                All Courses
                            </button>
                            {isAuthenticated && (
                                <button
                                    onClick={() => setActiveTab("my")}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "my"
                                        ? "bg-[#0d1f5c] text-white shadow-md transform scale-105"
                                        : "text-gray-500 hover:text-[#0d1f5c] hover:bg-white/80"
                                        }`}
                                >
                                    <Layers className="h-4 w-4" />
                                    My Courses
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search & Categories (Only for All Courses) */}


                    {/* Error banner when API failed but we have fallback courses */}
                    {error && courses.length > 0 && (
                        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-[#d4940a]/10 border border-[#d4940a]/20 px-4 py-3">
                            <p className="text-sm text-[#0d1f5c] font-medium">Couldn&apos;t reach server. Showing sample courses.</p>
                            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-[#0d1f5c] text-[#0d1f5c] hover:bg-[#0d1f5c] hover:text-white">Try again</Button>
                        </div>
                    )}

                    {/* Course Grid */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 className="h-12 w-12 animate-spin text-[#d4940a] mb-4" />
                                <p className="text-[#0d1f5c] font-medium">Loading courses…</p>
                            </div>
                        ) : error && courses.length === 0 ? (
                            <div className="text-center py-24 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100">
                                <AlertCircle className="h-12 w-12 text-[#d4940a] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-[#0d1f5c] mb-2">Could not load courses</h3>
                                <p className="text-gray-500 mb-4">{error}</p>
                                <Button onClick={() => refetch()} className="bg-[#d4940a] hover:bg-[#b57c06] text-white">Try again</Button>
                            </div>
                        ) : filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredCourses.map(course => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        isEnrolled={effectiveEnrolledIds.includes(course.id)}
                                        href={`/courses/${course.id}`}
                                        demoMode={isDemoMode}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0d1f5c]/5 mb-6">
                                    <Search className="h-10 w-10 text-[#0d1f5c]/40" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0d1f5c] mb-2">No courses found</h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                    We couldn't find any courses matching your criteria.
                                </p>
                                <Button
                                    className="bg-[#d4940a] hover:bg-[#b57c06] text-white rounded-xl shadow-md"
                                    onClick={() => { setActiveTab("all"); setActiveCategory("All"); setSearchQuery(""); }}
                                >
                                    Browse All Courses
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
