"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCoursePageData, CourseItem } from "@/lib/courseData";

export function CoursesFeature() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allCourses, setAllCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackCourses: CourseItem[] = [
    {
      id: "1",
      title: "Home Science",
      category: "CBSE Board",
      instructor: "Expert Instructor",
      rating: 5,
      students: 5,
      duration: "90 Mins",
      price: 0,
      originalPrice: 999,
      description: "Knowledge for Better Living. Skills for a Better Tomorrow.",
      thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      board: "CBSE",
      classname: "XI",
      subject: "Home Science",
      tabs: ["Curriculum"],
      curriculum: [],
    },
    {
      id: "2",
      title: "demo course 3",
      category: "General",
      instructor: "Demo Instructor",
      rating: 5,
      students: 1,
      duration: "45 Mins",
      price: 0,
      originalPrice: 999,
      description: "Learn fundamental principles and core academic concepts.",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tabs: ["Curriculum"],
      curriculum: [],
    },
    {
      id: "3",
      title: "Psychology",
      category: "CBSE Board",
      instructor: "Expert Instructor",
      rating: 5,
      students: 3,
      duration: "60 Mins",
      price: 0,
      originalPrice: 999,
      description: "Understand Mind. Decode Behaviour. Awareness today, Insight tomorrow.",
      thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      board: "CBSE",
      classname: "XI",
      subject: "Psychology",
      tabs: ["Curriculum"],
      curriculum: [],
    },
    {
      id: "4",
      title: "Class 10 Physics & Chemistry Booster",
      category: "CBSE Board",
      instructor: "Dr. Jane Smith",
      rating: 4.9,
      students: 1250,
      duration: "120 Mins",
      price: 0,
      originalPrice: 999,
      description: "Master Light, Electricity, Chemical Reactions with 1-on-1 doubt solving.",
      thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      board: "CBSE",
      classname: "X",
      subject: "Science",
      tabs: ["Curriculum"],
      curriculum: [],
    },
    {
      id: "5",
      title: "IIT-JEE Mechanics & Vector Calculus",
      category: "IIT-JEE",
      instructor: "Prof. Robert Vance",
      rating: 4.95,
      students: 2400,
      duration: "180 Mins",
      price: 0,
      originalPrice: 999,
      description: "Advanced problem solving, rotational dynamics & vector calculus.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      subject: "Physics",
      tabs: ["Curriculum"],
      curriculum: [],
    },
    {
      id: "6",
      title: "NEET-UG Medical Biology Target Batch",
      category: "NEET Medical",
      instructor: "Dr. Ananya Roy (AIIMS)",
      rating: 4.88,
      students: 1890,
      duration: "150 Mins",
      price: 0,
      originalPrice: 999,
      description: "Botany, Zoology, Cell Biology & NCERT line-by-line breakdown.",
      thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      subject: "Biology",
      tabs: ["Curriculum"],
      curriculum: [],
    },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchCoursePageData("demo");
        if (res.allCourses && res.allCourses.length > 0) {
          setAllCourses(res.allCourses);
        } else {
          setAllCourses(fallbackCourses);
        }
      } catch (err) {
        setAllCourses(fallbackCourses);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayCourses = allCourses.length > 0 ? allCourses : fallbackCourses;

  const filteredCourses = displayCourses.filter((c) => {
    return (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#fafbfe] text-slate-900 font-sans">
      {/* Background Grid Pattern Matching Image 5 */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0d1f5c15_1px,transparent_1px),linear-gradient(to_bottom,#0d1f5c15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Glowing Accents */}
      <div className="absolute top-0 right-0 z-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-[#d4940a]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] left-[-10%] z-0 w-[400px] h-[400px] bg-[#0d1f5c]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Explore Courses Header Row Matching Image 5 (Only All Courses button, My Enrolled removed) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d1f5c] tracking-tight">
              Explore Courses
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Discover new skills and reach your goals
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl px-5 py-2.5 text-xs font-extrabold bg-[#0d1f5c] text-white shadow-md flex items-center gap-2">
              <span>📖 All Courses</span>
            </div>
          </div>
        </div>

        {/* Search Bar Row (Category filter pills removed) */}
        <div className="mb-8 max-w-md">
          <input
            type="text"
            placeholder="Search course title or mentor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none shadow-sm"
          />
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-xs font-bold">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
            <p>Loading course catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-slate-500">
            <p className="text-sm font-bold text-[#0d1f5c] mb-1">No courses found</p>
            <p className="text-xs">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="group flex flex-col h-full overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl cursor-pointer"
              >
                {/* Thumbnail Image Box */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <img
                    src={
                      c.thumbnail ||
                      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    }
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

                  {/* Top-Left Badges */}
                  <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
                    <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                      GUEST
                    </span>
                    {c.classname && (
                      <span className="rounded-md bg-[#0d1f5c] px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                        CLASS {c.classname}
                      </span>
                    )}
                  </div>

                  {/* Bottom Overlay Info */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-white text-xs font-semibold">
                    <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm text-[11px]">
                      👥 {c.students || 1}+ Enrolled
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 text-xs font-extrabold bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                      ⭐ {c.rating || 5}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-grow p-5">
                  <h3 className="text-lg font-extrabold text-[#0d1f5c] group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {c.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {c.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>👨‍🏫 {c.instructor || "Expert Mentor"}</span>
                    <span>⏱️ {c.duration || "45 Mins"}</span>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">Verified Mentor Batch</span>
                    <Link
                      href="/get-started"
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-1"
                    >
                      <span>Login to Enroll</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
