"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Users, Star, ArrowRight, Play, Book, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { HOME_PATHS, API_AUTH_BASE } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  subject: string;
  thumbnail: string;
  difficulty: string;
  rating: number;
  totalenrollment: number;
  enrollmentStatus?: number;
}

interface CourseProgressListProps {
  courseType?: string;
}

// Get country synchronously from localStorage
const getInitialCountry = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  let countryValue = localStorage.getItem("country") || undefined;

  if (!countryValue) {
    try {
      const authData = localStorage.getItem("auth-storage");
      if (authData) {
        const parsed = JSON.parse(authData);
        countryValue = parsed.state?.user?.country;
      }
    } catch (e) {
      // Silent fail
    }
  }
  return countryValue;
};

export default function CourseProgressList({ courseType }: CourseProgressListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | undefined>(() => getInitialCountry());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const router = useRouter();
  const { user } = useAuth();

  // Update country from useAuth when it becomes available
  useEffect(() => {
    if (user?.country) {
      setCountry(user.country);
    }
  }, [user]);

  // Fetch courses when country OR courseType changes
  useEffect(() => {
    fetchCourses();
  }, [country, courseType]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const studentId = user?.studentId || "demo";
      const url = `${API_AUTH_BASE}${HOME_PATHS.homeData(studentId, courseType, country)}`;

      const res = await axios.get(url);

      if (res.data?.success) {
        const data = res.data.data?.topRatedCourses || [];
        const updated = data.map((course: any) => ({
          ...course,
          thumbnail: course.thumbnail?.startsWith("http")
            ? course.thumbnail
            : `${API_AUTH_BASE}/${course.thumbnail?.replace(/^\/+/, "")}`,
        }));

        setCourses(updated);
      }
    } catch (error: any) {
      console.error(
        "Course Fetch Error:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      // Check initial state
      handleScroll();
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, courses]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 344; // 320px (card) + 24px (gap-6)
      const containerWidth = scrollRef.current.clientWidth;
      // Scroll by approximately 80% of the container width, snapped to the nearest card
      const scrollAmount = Math.max(cardWidth, Math.floor((containerWidth * 0.8) / cardWidth) * cardWidth);
      
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCourseClick = (courseCode: string) => {
    router.push(`/courses/${courseCode}`);
  };

  if (loading) {
    return (
      <div className="flex gap-6 overflow-hidden -mx-4 px-4 pb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[280px] md:w-[320px] h-[340px] bg-white rounded-2xl border border-gray-100 p-2 shadow-sm animate-pulse relative overflow-hidden">
            <div className="h-44 bg-gray-50 rounded-xl mb-4" />
            <div className="px-4 space-y-4">
              <div className="h-5 w-3/4 bg-gray-50 rounded-md" />
              <div className="flex gap-3">
                 <div className="h-4 w-16 bg-gray-50 rounded-md" />
                 <div className="h-4 w-16 bg-gray-50 rounded-md" />
              </div>
              <div className="h-10 w-full bg-gray-50 rounded-xl mt-6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
            <Book className="h-10 w-10 text-gray-300" />
        </div>
        <p className="text-[#0d1f5c] font-black text-xl tracking-tight">No Courses Found</p>
        <p className="text-gray-500 text-sm mt-2 max-w-[200px]">We couldn't find any courses matching your current filter.</p>
      </div>
    );
  }

  return (
    <div className="relative group/nav">
      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-30 w-14 h-14 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full flex items-center justify-center shadow-2xl text-[#0d1f5c] hover:bg-[#d4940a] hover:text-white hover:border-[#d4940a] hover:scale-110 active:scale-95 transition-all duration-500 ease-out opacity-0 group-hover/nav:opacity-100 group-hover/nav:-translate-x-3 hidden md:flex"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-30 w-14 h-14 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full flex items-center justify-center shadow-2xl text-[#0d1f5c] hover:bg-[#d4940a] hover:text-white hover:border-[#d4940a] hover:scale-110 active:scale-95 transition-all duration-500 ease-out opacity-0 group-hover/nav:opacity-100 group-hover/nav:translate-x-3 hidden md:flex"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide -mx-4 px-4 hide-scrollbar"
      >
        <div className="flex gap-6 pb-10 min-w-max">
          {courses.map((course) => {
            const isEnrolled = course.enrollmentStatus === 1;

            return (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.courseCode)}
                className="w-[280px] md:w-[320px] bg-white border border-gray-100 hover:border-[#0d1f5c]/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(13,31,92,0.15),0_0_30px_rgba(13,31,92,0.1)] transition-all duration-500 cursor-pointer flex flex-col h-full group transform hover:-translate-y-2 relative"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-gray-50">
                  <img
                    src={course.thumbnail || "/placeholder.jpg"}
                    alt={course.courseName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Subject Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#0d1f5c] text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-lg shadow-[#0d1f5c]/20 uppercase tracking-[0.1em] border border-white/20">
                      {course.subject || "Course"}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-[#0d1f5c] text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xl">
                    <Star className="h-3 w-3 text-[#d4940a] fill-[#d4940a]" />
                    <span>{Number(course.rating || 0).toFixed(1)}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50/30">
                  <h3 className="font-extrabold text-[#0d1f5c] text-base leading-tight line-clamp-2 mb-3 group-hover:text-[#d4940a] transition-colors duration-300">
                    {course.courseName || "Untitled Course"}
                  </h3>

                  <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium mb-6">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span>{Number(course.totalenrollment || 0).toLocaleString()}</span>
                    </div>
                    {course.difficulty && (
                      <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        {course.difficulty}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    {isEnrolled ? (
                      <button className="w-full bg-[#0d1f5c] hover:bg-[#152a75] text-white py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#0d1f5c]/20 group/btn">
                        <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                          <Play className="h-3 w-3 fill-white" />
                        </div>
                        Continue Learning
                      </button>
                    ) : (
                      <button className="w-full border-2 border-gray-100 text-[#0d1f5c] hover:border-[#d4940a] hover:bg-[#d4940a] hover:text-white py-3 rounded-xl text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                        View Details
                        <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
