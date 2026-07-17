// Dynamic course data - fetched from backend API only

import { useState, useEffect, useCallback } from "react";
import { API_AUTH_BASE, COURSE_PATHS } from "@/lib/api";


// Content types for course materials
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
    // Additional fields for detailed view
    courseStartDate?: string;
    courseEndDate?: string;
    subcategory?: string;
    stream?: string;
    tabs: string[];
    curriculum: {
        id: number;
        title: string;
        duration: string;
        type: "video" | "worksheet";
        isCompleted: boolean;
        isLocked: boolean;
    }[];
}

// Cache populated by fetchCoursePageData — used by getCourseById / isEnrolledIn when set
let coursesCache: CourseItem[] | null = null;
let enrolledIdsCache: string[] | null = null;
let myCoursesCache: CourseItem[] | null = null;
let allCoursesCache: CourseItem[] | null = null;

export function setCourseDataCache(courses: CourseItem[], enrolledIds: string[]) {
    coursesCache = courses;
    enrolledIdsCache = enrolledIds;
}

export function setCoursePageDataCache(myCourses: CourseItem[], allCourses: CourseItem[], enrolledIds: string[]) {
    myCoursesCache = myCourses;
    allCoursesCache = allCourses;
    enrolledIdsCache = enrolledIds;
    // Combine for backwards compatibility
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
    
    // Try multiple field names for thumbnail
    let thumbnail = String(getFirst<string>(o, "thumbnail", "image", "thumbnailUrl", "imageUrl", "thumbnail_url", "image_url", "coverImage", "cover_image") ?? "");
    
    // If thumbnail doesn't start with http, prepend backend URL
    // Fix thumbnail URL properly
if (thumbnail && !thumbnail.startsWith("http")) {
    thumbnail = `${API_AUTH_BASE}/${thumbnail.replace(/^\/+/, "")}`;
}
    const instructor = String(getFirst<string>(o, "instructor", "teacherName", "instructorName", "teacher_name") ?? "");
    
    // Use converted prices from API (which are country-specific) - these are strings from API
    // Fall back to original fields if converted values not available
    const convertedDiscountedPrice = getFirst<string>(o, "convertedDiscountedPrice");
    const convertedMrp = getFirst<string>(o, "convertedMrp");
    
    const price = convertedDiscountedPrice ? parseFloat(convertedDiscountedPrice) : 
                  Number(getFirst<number>(o, "discountedprice", "price", "sellingPrice", "selling_price")) || 0;
    const originalPrice = convertedMrp ? parseFloat(convertedMrp) : 
                         Number(getFirst<number>(o, "mrp", "originalPrice", "actualPrice", "actual_price")) || price || 999;
    
    const rating = Number(getFirst<number>(o, "rating", "avgRating", "avg_rating")) || 0;
    const students = Number(getFirst<number>(o, "totalenrollment", "students", "enrolledCount", "enrolled_count")) || 0;
    const duration = String(getFirst<string>(o, "duration", "courseDuration", "course_duration") ?? "");
    const isLive = Boolean(getFirst<boolean>(o, "isLive", "is_live"));
    const category = String(getFirst<string>(o, "category", "courseCategory", "course_category") ?? "");
    const courseType = String(getFirst<string>(o, "courseType", "course_type") ?? "");
    const board = String(getFirst<string>(o, "board") ?? "");
    const classname = String(getFirst<string>(o, "classname", "class_name") ?? "");
    const subject = String(getFirst<string>(o, "subject") ?? "");
    const medium = String(getFirst<string>(o, "medium") ?? "");
    const totalLessons = Number(getFirst<number>(o, "totalLessons", "total_lessons")) || 0;
    const difficulty = String(getFirst<string>(o, "difficulty", "courseDifficulty") ?? "");
    const currencySymbol = String(getFirst<string>(o, "currencySymbol") ?? "₹");
    const currencyCode = String(getFirst<string>(o, "currencyCode") ?? "INR");
    const courseStartDate = String(getFirst<string>(o, "courseStartDate", "startDate", "start_date") ?? "");
    const courseEndDate = String(getFirst<string>(o, "deadline", "courseEndDate", "endDate", "end_date") ?? "");
    const subcategory = String(getFirst<string>(o, "subcategory", "subCategory") ?? "");
    const stream = String(getFirst<string>(o, "stream") ?? "");
    const rawCurriculum = getFirst<unknown[]>(o, "curriculum", "chapters", "modules", "lessons", "syllabus");
    const curriculum = Array.isArray(rawCurriculum)
        ? rawCurriculum.slice(0, 20).map((item, i) => {
            const r = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
            return {
                id: Number(getFirst<number>(r, "id", "lessonId", "lesson_id")) || i + 1,
                title: String(getFirst<string>(r, "title", "name", "lessonName", "lesson_name") ?? "Lesson"),
                duration: String(getFirst<string>(r, "duration", "durationMinutes", "duration_minutes") ?? ""),
                type: (String(getFirst<string>(r, "type", "contentType", "content_type") ?? "video").toLowerCase().includes("sheet") || String(getFirst<string>(r, "type")).toLowerCase() === "worksheet" ? "worksheet" : "video") as "video" | "worksheet",
                isCompleted: Boolean(getFirst<boolean>(r, "isCompleted", "is_completed", "completed")),
                isLocked: Boolean(getFirst<boolean>(r, "isLocked", "is_locked", "locked")),
            };
        })
        : [
            { id: 1, title: "Introduction", duration: "", type: "video" as const, isCompleted: false, isLocked: false },
        ];
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
        medium,
        totalLessons,
        difficulty,
        currencySymbol,
        currencyCode,
        courseStartDate,
        courseEndDate,
        subcategory,
        stream,
        tabs: ["Curriculum", "Materials", "Announcements"],
        curriculum,
    };
}

/** Extract courses array and enrolled IDs from various backend response shapes */
function mapApiResponseToCourseData(response: unknown): { 
    courses: CourseItem[]; 
    enrolledIds: string[];
    myCourses: CourseItem[];
    allCourses: CourseItem[];
} {
    const o = (response && typeof response === "object" ? response : {}) as Record<string, unknown>;
    // Handle { data: [...] } or { data: { allCourses: [], mycourses: [] } }
    const data = getFirst<unknown>(o, "data", "result") ?? o;

    let rawAllCourses: unknown[] = [];
    let rawMyCourses: unknown[] = [];
    let enrolledIds: string[] = [];

    if (Array.isArray(data)) {
        // Handle { data: [ { courseCode, enrollmentStatus }, ... ] }
        rawAllCourses = data;
        data.forEach((c, i) => {
            const r = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
            const isEnrolled = Number(getFirst<number>(r, "enrollmentStatus", "isEnrolled", "is_enrolled")) > 0 ||
                Boolean(getFirst<boolean>(r, "enrolled"));
            if (isEnrolled) {
                enrolledIds.push(String(getFirst<string>(r, "courseCode", "id", "courseId", "course_id") ?? i + 1));
            }
        });
    } else if (data && typeof data === "object") {
        const dataObj = data as Record<string, unknown>;
        
        // Get allCourses (non-enrolled/featured courses)
        rawAllCourses = getFirst<unknown[]>(dataObj, "allCourses") ??
            getFirst<unknown[]>(o, "courses") ??
            getFirst<unknown[]>(dataObj, "courses", "courseList", "course_list", "list") ?? [];

        // Get mycourses (enrolled courses)
        rawMyCourses = getFirst<unknown[]>(dataObj, "mycourses") ?? [];
        
        if (Array.isArray(rawMyCourses)) {
            enrolledIds = rawMyCourses.map(c => {
                const r = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
                return String(getFirst<string>(r, "courseCode", "id", "courseId", "course_id"));
            });
        } else {
            const rawEnrolled = getFirst<unknown[]>(o, "enrolledCourseIds", "enrolledIds", "enrolled_ids") ??
                getFirst<unknown[]>(dataObj, "enrolledCourseIds", "enrolledIds", "enrolled_ids");
            if (Array.isArray(rawEnrolled)) {
                enrolledIds = rawEnrolled.map((x) => String(x));
            } else if (Array.isArray(rawAllCourses)) {
                rawAllCourses.forEach((c, i) => {
                    const r = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
                    const isEnrolled = Number(getFirst<number>(r, "enrollmentStatus", "isEnrolled", "is_enrolled")) > 0 ||
                        Boolean(getFirst<boolean>(r, "enrolled"));
                    if (isEnrolled) {
                        enrolledIds.push(String(getFirst<string>(r, "id", "courseId", "course_id") ?? i + 1));
                    }
                });
            }
        }
    } else if (Array.isArray(response)) {
        rawAllCourses = response;
    }

    // Map to CourseItem format
    const myCourses = Array.isArray(rawMyCourses) ? rawMyCourses.map(mapApiCourseToItem) : [];
    const allCourses = Array.isArray(rawAllCourses) ? rawAllCourses.map(mapApiCourseToItem) : [];
    
    // Combine both for backwards compatibility
    const courses = [...myCourses, ...allCourses];
    
    return { courses, enrolledIds, myCourses, allCourses };
}

/** In the browser we use our own API proxy to avoid mixed content (HTTPS page → HTTP API). */
function getCoursePageDataUrl(studentId: string, country?: string): string {
    return `${API_AUTH_BASE}${COURSE_PATHS.coursePageData(studentId, country)}`;
}

export async function fetchCoursePageData(studentId?: string, country?: string): Promise<{ 
    courses: CourseItem[]; 
    enrolledIds: string[];
    myCourses: CourseItem[];
    allCourses: CourseItem[];
}> {
    let id = studentId;

    if (!id && typeof window !== "undefined") {
        const token = localStorage.getItem("cp_token");
        if (token) {
            const localStudentId = localStorage.getItem("studentId");
            if (localStudentId) {
                id = localStudentId;
            } else {
                try {
                    const authData = localStorage.getItem("auth-storage");
                    if (authData) {
                        const parsed = JSON.parse(authData);
                        if (parsed.state?.user?.studentId) {
                            id = parsed.state.user.studentId;
                        }
                    }
                } catch (e) {
                    // Silent fail
                }
            }
        }
    }

    if (!id) {
        id = "demo";
    }

    const url = getCoursePageDataUrl(id, country);
    const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;
    const headers: Record<string, string> = {
        "Accept": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Course data failed: ${res.status}`);
        const json: unknown = await res.json();
        const { courses, enrolledIds, myCourses, allCourses } = mapApiResponseToCourseData(json);
        
        // Update the caches
        setCoursePageDataCache(myCourses, allCourses, enrolledIds);
        
        return { courses, enrolledIds, myCourses, allCourses };
    } catch (err) {
        // Return empty arrays on error - UI should handle empty state
        return { courses: [], enrolledIds: [], myCourses: [], allCourses: [] };
    }
}

export function getCourses(): CourseItem[] {
    return coursesCache ?? [];
}

export function getMyCourses(): CourseItem[] {
    return myCoursesCache ?? [];
}

export function getAllCourses(): CourseItem[] {
    return allCoursesCache ?? [];
}

export function getCourseById(id: string): CourseItem | undefined {
    return getCourses().find((c) => c.id === id);
}

export function getEnrolledCourseIds(): string[] {
    return enrolledIdsCache ?? [];
}

export function isEnrolledIn(courseId: string): boolean {
    return getEnrolledCourseIds().includes(courseId);
}

export function useCoursePageData(studentId?: string, country?: string) {
    // Get country synchronously from localStorage to avoid race conditions
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

    const [courses, setCourses] = useState<CourseItem[]>(() => coursesCache ?? []);
    const [enrolledIds, setEnrolledIds] = useState<string[]>(() => enrolledIdsCache ?? []);
    const [myCourses, setMyCourses] = useState<CourseItem[]>(() => myCoursesCache ?? []);
    const [allCourses, setAllCourses] = useState<CourseItem[]>(() => allCoursesCache ?? []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Get country synchronously during initialization
    const [effectiveCountry, setEffectiveCountry] = useState<string | undefined>(() => getInitialCountry());

    const refetch = useCallback(async (countryToUse?: string) => {
        setLoading(true);
        setError(null);
        try {
            // Use provided country or fall back to initial country
            const countryParam = countryToUse ?? effectiveCountry ?? country;
            // console.log("[useCoursePageData] fetching course page data", { studentId, countryParam });
            const result = await fetchCoursePageData(studentId, countryParam);
            // console.log("[useCoursePageData] result", result);
            setCourses(result.courses);
            setEnrolledIds(result.enrolledIds);
            setMyCourses(result.myCourses);
            setAllCourses(result.allCourses);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to load courses";
            console.error("[useCoursePageData] fetch error", message);
            setError(message);
            setCourses([]);
            setEnrolledIds([]);
            setMyCourses([]);
            setAllCourses([]);
        } finally {
            setLoading(false);
        }
    }, [studentId, country, effectiveCountry]);

    useEffect(() => {
        refetch(effectiveCountry);
    }, [effectiveCountry, refetch]);

    return { courses, enrolledIds, myCourses, allCourses, loading, error, refetch };
}

// Fetch course content (notes, images, videos) for enrolled courses
export async function fetchCourseContent(
    studentId: string,
    courseCode: string,
    contentType?: CourseContentType
): Promise<CourseContent[]> {
    const url = `${API_AUTH_BASE}${COURSE_PATHS.getCourseContent(studentId, courseCode, contentType)}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;
    
    const headers: Record<string, string> = {
        "Accept": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Failed to fetch course content: ${res.status}`);
        const json: unknown = await res.json();
        
        const o = (json && typeof json === "object" ? json : {}) as Record<string, unknown>;
        const data = getFirst<unknown[]>(o, "data", "result") ?? [];
        
        return (data as CourseContent[]).map(item => ({
            ...item,
            id: String(item.id),
        }));
    } catch (err) {
        console.error("Error fetching course content:", err);
        return [];
    }
}

// Hook for fetching course content
export function useCourseContent(studentId: string, courseCode: string, contentType?: CourseContentType) {
    const [content, setContent] = useState<CourseContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCourseContent(studentId, courseCode, contentType);
            setContent(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load content");
            setContent([]);
        } finally {
            setLoading(false);
        }
    }, [studentId, courseCode, contentType]);

    useEffect(() => {
        if (studentId && courseCode) {
            refetch();
        }
    }, [studentId, courseCode, refetch]);

    return { content, loading, error, refetch };
}
