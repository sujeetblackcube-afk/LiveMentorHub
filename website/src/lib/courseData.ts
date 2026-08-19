// Dynamic course data - fetched from backend API (supporting both My Courses and All Explore Courses)

import { useState, useEffect, useCallback } from "react";
import { API_AUTH_BASE, COURSE_PATHS } from "@/lib/api";

export type CourseContentType = 'NOTES' | 'IMAGE' | 'RECORDED_VIDEO';

export interface CourseContent {
  id: string;
  courseName: string;
  courseCode: string;
  courseType: string;
  teacherName: string;
  teacherId: string;
  title: string;
  description: string;
  contentUrl: string;
  contentType: CourseContentType;
  createdAt: string;
  updatedAt: string;
}

export interface CourseItem {
  id: string;
  title: string;
  description: string;
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
  category: string;
  courseType?: string;
  board?: string;
  classname?: string;
  subject?: string;
  medium?: string;
  totalLessons?: number;
  difficulty?: string;
  currencySymbol?: string;
  currencyCode?: string;
  courseStartDate?: string;
  courseEndDate?: string;
  subcategory?: string;
  stream?: string;
  introVideo?: string;
  tabs: string[];
  hasReviewed?: boolean;
  enrollmentStatus?: number;
  curriculum: {
    id: number;
    title: string;
    duration: string;
    type: "video" | "worksheet";
    isCompleted: boolean;
    isLocked: boolean;
  }[];
}

let coursesCache: CourseItem[] | null = null;
let enrolledIdsCache: string[] | null = null;
let myCoursesCache: CourseItem[] | null = null;
let allCoursesCache: CourseItem[] | null = null;

export function setCoursePageDataCache(myCourses: CourseItem[], allCourses: CourseItem[], enrolledIds: string[]) {
  myCoursesCache = myCourses;
  allCoursesCache = allCourses;
  enrolledIdsCache = enrolledIds;
  coursesCache = [...myCourses, ...allCourses];
}

function getFirst<T>(obj: unknown, ...keys: string[]): T | undefined {
  if (obj == null || typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return undefined;
}

function mapApiCourseToItem(raw: unknown, index: number): CourseItem {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const id = String(getFirst<string>(o, "courseCode", "id", "courseId", "course_id") ?? index + 1);
  const title = String(getFirst<string>(o, "title", "courseName", "name", "course_name") ?? "Course");
  const description = String(getFirst<string>(o, "description", "courseDescription", "desc") ?? "");
  
  let thumbnail = String(getFirst<string>(o, "thumbnail", "image", "thumbnailUrl", "imageUrl", "thumbnail_url", "image_url", "coverImage", "cover_image") ?? "");
  if (thumbnail && !thumbnail.startsWith("http")) {
    thumbnail = `${API_AUTH_BASE}/${thumbnail.replace(/^\/+/, "")}`;
  }
  const instructor = String(getFirst<string>(o, "instructor", "teacherName", "instructorName", "teacher_name") ?? "Mentor");
  
  const price = Number(getFirst<number>(o, "discountedprice", "price", "sellingPrice")) || 0;
  const originalPrice = Number(getFirst<number>(o, "mrp", "originalPrice", "actualPrice")) || price || 999;
  
  const rating = Number(getFirst<number>(o, "rating", "avgRating")) || 4.8;
  const students = Number(getFirst<number>(o, "totalenrollment", "students")) || 1200;
  const duration = String(getFirst<string>(o, "duration", "courseDuration") ?? "90 Hours");
  const isLive = Boolean(getFirst<boolean>(o, "isLive", "is_live"));
  const category = String(getFirst<string>(o, "category", "courseCategory", "board") ?? "General");
  const courseType = String(getFirst<string>(o, "courseType", "course_type") ?? "");
  const board = String(getFirst<string>(o, "board") ?? "");
  const classname = String(getFirst<string>(o, "classname", "class_name") ?? "");
  const subject = String(getFirst<string>(o, "subject") ?? "");
  const enrollmentStatus = Number(getFirst<number>(o, "enrollmentStatus", "isEnrolled")) || 0;

  return {
    id,
    title,
    description,
    thumbnail,
    instructor,
    price,
    originalPrice,
    rating,
    students,
    duration,
    isLive,
    category,
    courseType,
    board,
    classname,
    subject,
    enrollmentStatus,
    tabs: ["Curriculum", "Materials", "Announcements"],
    curriculum: [
      { id: 1, title: "Introduction & Core Fundamentals", duration: "1h 30m", type: "video", isCompleted: false, isLocked: false },
      { id: 2, title: "Advanced Conceptual Problem Solving", duration: "2h 15m", type: "video", isCompleted: false, isLocked: false },
    ],
  };
}

export function mapApiResponseToCourseData(response: unknown): { 
  courses: CourseItem[]; 
  enrolledIds: string[];
  myCourses: CourseItem[];
  allCourses: CourseItem[];
} {
  const o = (response && typeof response === "object" ? response : {}) as Record<string, unknown>;
  const data = getFirst<unknown>(o, "data", "result") ?? o;

  let rawAllCourses: unknown[] = [];
  let rawMyCourses: unknown[] = [];
  let enrolledIds: string[] = [];

  if (Array.isArray(data)) {
    rawAllCourses = data;
  } else if (data && typeof data === "object") {
    const dataObj = data as Record<string, unknown>;
    rawAllCourses = getFirst<unknown[]>(dataObj, "allCourses") ?? getFirst<unknown[]>(o, "courses") ?? [];
    rawMyCourses = getFirst<unknown[]>(dataObj, "mycourses") ?? [];
  }

  const myCourses = Array.isArray(rawMyCourses) ? rawMyCourses.map(mapApiCourseToItem) : [];
  const allCourses = Array.isArray(rawAllCourses) ? rawAllCourses.map(mapApiCourseToItem) : [];
  const courses = [...myCourses, ...allCourses];

  return { courses, enrolledIds, myCourses, allCourses };
}

export async function fetchCoursePageData(studentId: string = "demo"): Promise<{ 
  courses: CourseItem[]; 
  enrolledIds: string[];
  myCourses: CourseItem[];
  allCourses: CourseItem[];
}> {
  const url = `${API_AUTH_BASE}${COURSE_PATHS.coursePageData(studentId)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Course data failed: ${res.status}`);
    const json: unknown = await res.json();
    const result = mapApiResponseToCourseData(json);
    setCoursePageDataCache(result.myCourses, result.allCourses, result.enrolledIds);
    return result;
  } catch (err) {
    return { courses: [], enrolledIds: [], myCourses: [], allCourses: [] };
  }
}

export function useCoursePageData(studentId: string = "demo") {
  const [courses, setCourses] = useState<CourseItem[]>(() => coursesCache ?? []);
  const [myCourses, setMyCourses] = useState<CourseItem[]>(() => myCoursesCache ?? []);
  const [allCourses, setAllCourses] = useState<CourseItem[]>(() => allCoursesCache ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCoursePageData(studentId);
      setCourses(result.courses);
      setMyCourses(result.myCourses);
      setAllCourses(result.allCourses);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load course data");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { courses, myCourses, allCourses, loading, error, refetch };
}
