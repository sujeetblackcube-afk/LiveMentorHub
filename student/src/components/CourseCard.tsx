"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, Star, ArrowRight, BookOpen, PlayCircle, Layers } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { EnrollmentModal } from "@/components/courses/EnrollmentModal";
import { useAuth } from "@/store/useAuth";

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  instructor: string;
  price: number;
  originalPrice: number;
  rating: number;
  students: number;
  duration: string;
  isLive?: boolean;
  level?: string;
  daysLeft?: number;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  curriculum?: any[];
  reviews?: { user: string; rating: number; comment: string }[];
  features?: string[];
  category?: string;
  courseType?: string;
  board?: string;
  classname?: string;
  subject?: string;
  medium?: string;
  totalLessons?: number;
  difficulty?: string;
  currencySymbol?: string;
}

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  /** 0–100, shown only when isEnrolled=true */
  progress?: number;
  lastLesson?: string;
  onClick?: () => void;
  href?: string;
  demoMode?: boolean;
  className?: string;
}

export default function CourseCard({
  course,
  isEnrolled = false,
  progress = 0,
  lastLesson,
  onClick,
  href,
  demoMode = false,
  className,
}: CourseCardProps) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const discount = Math.round(
    ((course.originalPrice - course.price) / course.originalPrice) * 100
  );

  const destination = href ?? `/courses/${course.id}`;

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setEnrollOpen(true);
  };

  return (
    <>
      <Link
        href={destination}
        className="block h-full"
        onClick={onClick}
      >
        <div
          className={cn(
            "group flex flex-col h-full overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl cursor-pointer",
            className
          )}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            <img
              src={
                course.thumbnail ||
                "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80"
              }
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges top-left */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
              {course.isLive && (
                <Badge className="bg-red-500 text-white border-0 shadow-sm animate-pulse">
                  LIVE
                </Badge>
              )}
              {demoMode && !isAuthenticated && (
                <Badge className="bg-indigo-600 text-white border-0 shadow-sm">
                  GUEST
                </Badge>
              )}
              {isEnrolled && (
                <Badge className="bg-green-500 text-white border-0 shadow-sm">
                  Enrolled
                </Badge>
              )}
              {course.level && (
                <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm border-0 shadow-sm">
                  {course.level}
                </Badge>
              )}
            </div>

            {/* Bottom overlay */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5 text-xs font-medium bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                <Users className="h-3 w-3" />
                <span>{course.students.toLocaleString()}+ Enrolled</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-yellow-400">
                <Star className="h-3 w-3 fill-current" />
                <span>{course.rating}</span>
              </div>
            </div>

            {/* Resume pill for enrolled */}
            {isEnrolled && (
              <div className="absolute bottom-3 right-3 z-30 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <PlayCircle className="h-3 w-3" />
                Resume
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-grow p-5">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 md:text-lg">
              {course.title}
            </h3>

            <div className="mt-2 flex items-center gap-4 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{course.instructor || "Expert Instructor"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{course.duration ? `${course.duration} mins` : "Self-paced"}</span>
              </div>
            </div>

            {/* Academic Info */}
            {(course.board || course.classname || course.subject || course.medium) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {course.board && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                    {course.board}
                  </span>
                )}
                {course.classname && (
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                    Class {course.classname}
                  </span>
                )}
                {course.subject && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    {course.subject}
                  </span>
                )}
                {course.medium && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                    {course.medium}
                  </span>
                )}
              </div>
            )}

            {/* metadata footer */}
            <div className="mt-2 flex items-center justify-between">
              {course.totalLessons !== undefined && course.totalLessons > 0 && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {course.totalLessons} Lessons
                </p>
              )}
              {course.difficulty && (
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
                  {course.difficulty}
                </p>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 mt-4">
              {isEnrolled ? (
                /* ─── Enrolled state: progress bar ─── */
                <div className="space-y-2">
                  {lastLesson && (
                    <p className="text-xs text-gray-500 truncate">{lastLesson}</p>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span className="font-semibold text-indigo-600">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="h-9 w-full rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-medium group-hover:bg-indigo-700 transition-colors mt-1">
                    <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                    Continue Learning
                  </div>
                </div>
              ) : (
                /* ─── Not enrolled: price + Enroll button ─── */
                <div className="flex items-end justify-between">
                  <div>
                  <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {course.currencySymbol}{course.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {course.currencySymbol}{course.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-bold">{discount}% OFF</p>
                  </div>

                  {/* Enroll button — stops propagation so the Link doesn't fire */}
                  <button
                    type="button"
                    onClick={handleEnrollClick}
                    className="h-9 px-4 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200 flex items-center justify-center text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    {isAuthenticated ? "Enroll Now" : demoMode ? "Login to Enroll" : "Login to Buy"}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Enrollment modal — self-contained inside the card */}
      <EnrollmentModal
        isOpen={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        courseCode={course.id}
        price={course.price}
        courseTitle={course.title}
        currencySymbol={course.currencySymbol || "₹"}
        originalPrice={course.originalPrice}
      />
    </>
  );
}
