"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, AppWindow } from "lucide-react";
import axios from "axios";
import { HOME_PATHS, API_AUTH_BASE } from "@/lib/api";
import { useAuth } from "@/store/useAuth";

interface Subject {
  id: number | string;
  subjectName: string;
  subjectCode: string;
  ForClass: string;
  courseCode?: string;
  courseId?: string;
  course_code?: string;
  course_id?: string;
}

interface ClassItem {
  id: number;
  className: string;
  class_description: string;
  subjects: Subject[];
}

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

export function ClassCategoryList() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | undefined>(() => getInitialCountry());
  const { user } = useAuth();

  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.country) {
      setCountry(user.country);
    }
  }, [user]);

  useEffect(() => {
    fetchClasses();
  }, [country]);

  const fetchClasses = async () => {
    try {
      const studentId = user?.studentId || "demo";
      const url = `${API_AUTH_BASE}${HOME_PATHS.homeData(studentId, undefined, country)}`;

      const res = await axios.get(url);
      if (res.data?.success) {
        const fetchedClasses = res.data.data?.classes || [];
        setClasses(fetchedClasses);
        if (fetchedClasses.length > 0 && expandedClassId === null) {
          setExpandedClassId(fetchedClasses[0].id); // Auto-select the first class
        }
      }
    } catch (error: any) {
      console.error(
        "Class Fetch Error:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 w-full bg-white border border-gray-200 rounded-2xl animate-pulse" />
    );
  }

  if (!classes.length) return null;

  const activeClass = classes.find(c => c.id === expandedClassId) || classes[0];
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-2xl shadow-[#0d1f5c]/5 relative overflow-hidden p-6 md:p-8">
      {/* Decorative subtle abstract inside the container */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#fff8e6] to-transparent opacity-60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100/60 pb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#0d1f5c] tracking-tight">Select Your Class</h3>
            <p className="text-sm md:text-base font-medium text-gray-500 mt-1.5">Choose a class to explore available subjects and start learning</p>
          </div>
        </div>

        {/* Classes Labelled in a Straight Line (Tabs) */}
        <div className="flex flex-wrap gap-3.5 mb-10">
          {classes.map((classItem) => {
            const isActive = expandedClassId === classItem.id;
            return (
              <button
                key={classItem.id}
                onClick={() => setExpandedClassId(classItem.id)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2.5 border ${isActive
                  ? 'bg-[#d4940a] text-white ring-4 ring-[#d4940a]/20 border-[#d4940a] shadow-xl shadow-[#d4940a]/20 transform -translate-y-1'
                  : 'bg-white text-gray-600 border-gray-200 shadow-sm hover:border-[#d4940a]/40 hover:bg-[#fff8e6] hover:text-[#0d1f5c] hover:shadow-md hover:-translate-y-0.5'
                  }`}
              >
                <AppWindow className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-[#0d1f5c]'}`} />
                Class {classItem.className}
              </button>
            );
          })}
        </div>

        {/* Subjects Expanded Below */}
        {activeClass && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-[#d4940a]/30 to-transparent flex-1" />
              <h4 className="text-xs font-black text-[#0d1f5c] uppercase tracking-[0.2em] px-4 py-1.5 bg-[#fef0c7]/40 rounded-full border border-[#d4940a]/10">
                Subjects for Class {activeClass.className}
              </h4>
              <div className="h-px bg-gradient-to-r from-transparent via-[#d4940a]/30 to-transparent flex-1" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {activeClass.subjects?.map((subject) => {
                return (
                  <Link
                    key={`${subject.subjectCode || subject.id}-${activeClass.className}`}
                    href={`/courses?subject=${encodeURIComponent(subject.subjectName)}&class=${encodeURIComponent(activeClass.className)}`}
                    className="group relative flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#0d1f5c]/5 hover:border-[#d4940a]/40 transition-all duration-300 overflow-hidden transform hover:-translate-y-1.5"
                  >
                    {/* Subtle Hover Gradient Base */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fff8e6]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center gap-3.5 w-full">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0d1f5c]/5 group-hover:bg-[#0d1f5c] group-hover:shadow-lg group-hover:shadow-[#0d1f5c]/20 text-[#0d1f5c] group-hover:text-white transition-all duration-300">
                        <GraduationCap className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <span className="text-[14px] font-bold text-[#0d1f5c] px-1 text-center line-clamp-2 w-full leading-snug group-hover:text-[#d4940a] transition-colors">
                        {subject.subjectName}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {(!activeClass.subjects || activeClass.subjects.length === 0) && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-gray-300">
                  <AppWindow className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-semibold tracking-wide text-lg">No subjects available for this class.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
