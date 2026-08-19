// Dynamic course data - fetched from backend API only

import { useState, useEffect, useCallback } from "react";
import { API_AUTH_BASE, COURSE_PATHS } from "@/lib/api";

// Cache populated by fetchCoursePageData — used by getCourseById / isEnrolledIn when set
let coursesCache = null;
let enrolledIdsCache = null;
let myCoursesCache = null;
let allCoursesCache = null;

export function setCourseDataCache(courses, enrolledIds) {
    coursesCache = courses;
    enrolledIdsCache = enrolledIds;
}

export function setCoursePageDataCache(myCourses, allCourses, enrolledIds) {
    myCoursesCache = myCourses;
    allCoursesCache = allCourses;
    enrolledIdsCache = enrolledIds;
    // Combine for backwards compatibility
    coursesCache = [...myCourses, ...allCourses];
}

function getFirst(obj, ...keys) {
    if (obj == null || typeof obj !== "object") return undefined;
    const o = obj;
    for (const k of keys) {
        const v = o[k];
        if (v !== undefined && v !== null) return v;
    }
    return undefined;
}

function mapApiCourseToItem(raw, index) {
    const o = raw && typeof raw === "object" ? raw : {};
    const id = String(getFirst(o, "courseCode", "id", "courseId", "course_id") ?? index + 1);
    const title = String(getFirst(o, "title", "courseName", "name", "course_name") ?? "Course");
    const description = String(getFirst(o, "description", "courseDescription", "desc") ?? "");
    
    // Try multiple field names for thumbnail
    let thumbnail = String(getFirst(o, "thumbnail", "image", "thumbnailUrl", "imageUrl", "thumbnail_url", "image_url", "coverImage", "cover_image") ?? "");
    
    // If thumbnail doesn't start with http, prepend backend URL
    // Fix thumbnail URL properly
    if (thumbnail && !thumbnail.startsWith("http")) {
        thumbnail = `${API_AUTH_BASE}/${thumbnail.replace(/^\/+/, "")}`;
    }
    const instructor = String(getFirst(o, "instructor", "teacherName", "instructorName", "teacher_name") ?? "");
    
    // Use converted prices from API (which are country-specific) - these are strings from API
    // Fall back to original fields if converted values not available
    const convertedDiscountedPrice = getFirst(o, "convertedDiscountedPrice");
    const convertedMrp = getFirst(o, "convertedMrp");
    
    const price = convertedDiscountedPrice ? parseFloat(convertedDiscountedPrice) : 
                  Number(getFirst(o, "discountedprice", "price", "sellingPrice", "selling_price")) || 0;
    const originalPrice = convertedMrp ? parseFloat(convertedMrp) : 
                         Number(getFirst(o, "mrp", "originalPrice", "actualPrice", "actual_price")) || price || 999;
    
    const rating = Number(getFirst(o, "rating", "avgRating", "avg_rating")) || 0;
    const students = Number(getFirst(o, "totalenrollment", "students", "enrolledCount", "enrolled_count")) || 0;
    const duration = String(getFirst(o, "duration", "courseDuration", "course_duration") ?? "");
    const isLive = Boolean(getFirst(o, "isLive", "is_live"));
    const category = String(getFirst(o, "category", "courseCategory", "course_category") ?? "");
    const courseType = String(getFirst(o, "courseType", "course_type") ?? "");
    const board = String(getFirst(o, "board") ?? "");
    const classname = String(getFirst(o, "classname", "class_name") ?? "");
    const subject = String(getFirst(o, "subject") ?? "");
    const medium = String(getFirst(o, "medium") ?? "");
    const totalLessons = Number(getFirst(o, "totalLessons", "total_lessons")) || 0;
    const difficulty = String(getFirst(o, "difficulty", "courseDifficulty") ?? "");
    const enrollmentStatus = Number(getFirst(o, "enrollmentStatus", "isEnrolled", "is_enrolled")) || 0;
    const currencySymbol = String(getFirst(o, "currencySymbol") ?? "₹");
    const currencyCode = String(getFirst(o, "currencyCode") ?? "INR");
    const courseStartDate = String(getFirst(o, "courseStartDate", "startDate", "start_date") ?? "");
    const courseEndDate = String(getFirst(o, "deadline", "courseEndDate", "endDate", "end_date") ?? "");
    const subcategory = String(getFirst(o, "subcategory", "subCategory") ?? "");
    const stream = String(getFirst(o, "stream") ?? "");
    const introVideo = String(getFirst(o, "introVideo", "introVideoUrl", "intro_video", "videoUrl") ?? "");
    const hasReviewed = Boolean(getFirst(o, "hasReviewed", "has_reviewed", "reviewed"));
    const rawCurriculum = getFirst(o, "curriculum", "chapters", "modules", "lessons", "syllabus");
    const curriculum = Array.isArray(rawCurriculum)
        ? rawCurriculum.slice(0, 20).map((item, i) => {
            const r = item && typeof item === "object" ? item : {};
            return {
                id: Number(getFirst(r, "id", "lessonId", "lesson_id")) || i + 1,
                title: String(getFirst(r, "title", "name", "lessonName", "lesson_name") ?? "Lesson"),
                duration: String(getFirst(r, "duration", "durationMinutes", "duration_minutes") ?? ""),
                type: String(getFirst(r, "type", "contentType", "content_type") ?? "video").toLowerCase().includes("sheet") || String(getFirst(r, "type")).toLowerCase() === "worksheet" ? "worksheet" : "video",
                isCompleted: Boolean(getFirst(r, "isCompleted", "is_completed", "completed")),
                isLocked: Boolean(getFirst(r, "isLocked", "is_locked", "locked")),
            };
        })
        : [
            { id: 1, title: "Introduction", duration: "", type: "video", isCompleted: false, isLocked: false },
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
        enrollmentStatus,
        currencySymbol,
        currencyCode,
        courseStartDate,
        courseEndDate,
        subcategory,
        stream,
        introVideo,
        tabs: ["Curriculum", "Materials", "Announcements"],
        hasReviewed,
        curriculum,
    };
}

/** Extract courses array and enrolled IDs from various backend response shapes */
function mapApiResponseToCourseData(response) {
    const o = response && typeof response === "object" ? response : {};
    // Handle { data: [...] } or { data: { allCourses: [], mycourses: [] } }
    const data = getFirst(o, "data", "result") ?? o;

    let rawAllCourses = [];
    let rawMyCourses = [];
    let enrolledIds = [];

    if (Array.isArray(data)) {
        // Handle { data: [ { courseCode, enrollmentStatus }, ... ] }
        rawAllCourses = data;
        data.forEach((c, i) => {
            const r = c && typeof c === "object" ? c : {};
            const isEnrolled = Number(getFirst(r, "enrollmentStatus", "isEnrolled", "is_enrolled")) > 0 ||
                Boolean(getFirst(r, "enrolled"));
            if (isEnrolled) {
                enrolledIds.push(String(getFirst(r, "courseCode", "id", "courseId", "course_id") ?? i + 1));
            }
        });
    } else if (data && typeof data === "object") {
        const dataObj = data;
        
        // Get allCourses (non-enrolled/featured courses)
        rawAllCourses = getFirst(dataObj, "allCourses") ??
            getFirst(o, "courses") ??
            getFirst(dataObj, "courses", "courseList", "course_list", "list") ?? [];

        // Get mycourses (enrolled courses)
        rawMyCourses = getFirst(dataObj, "mycourses") ?? [];
        
        if (Array.isArray(rawMyCourses)) {
            enrolledIds = rawMyCourses.map(c => {
                const r = c && typeof c === "object" ? c : {};
                return String(getFirst(r, "courseCode", "id", "courseId", "course_id"));
            });
        } else {
            const rawEnrolled = getFirst(o, "enrolledCourseIds", "enrolledIds", "enrolled_ids") ??
                getFirst(dataObj, "enrolledCourseIds", "enrolledIds", "enrolled_ids");
            if (Array.isArray(rawEnrolled)) {
                enrolledIds = rawEnrolled.map((x) => String(x));
            } else if (Array.isArray(rawAllCourses)) {
                rawAllCourses.forEach((c, i) => {
                    const r = c && typeof c === "object" ? c : {};
                    const isEnrolled = Number(getFirst(r, "enrollmentStatus", "isEnrolled", "is_enrolled")) > 0 ||
                        Boolean(getFirst(r, "enrolled"));
                    if (isEnrolled) {
                        enrolledIds.push(String(getFirst(r, "id", "courseId", "course_id") ?? i + 1));
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
function getCoursePageDataUrl(studentId, country) {
    return `${API_AUTH_BASE}${COURSE_PATHS.coursePageData(studentId, country)}`;
}

export async function fetchCoursePageData(studentId, country) {
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
    const headers = {
        "Accept": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Course data failed: ${res.status}`);
        const json = await res.json();
        const { courses, enrolledIds, myCourses, allCourses } = mapApiResponseToCourseData(json);
        
        // Update the caches
        setCoursePageDataCache(myCourses, allCourses, enrolledIds);
        
        return { courses, enrolledIds, myCourses, allCourses };
    } catch (err) {
        // Return empty arrays on error - UI should handle empty state
        return { courses: [], enrolledIds: [], myCourses: [], allCourses: [] };
    }
}

export function getCourses() {
    return coursesCache ?? [];
}

export function getMyCourses() {
    return myCoursesCache ?? [];
}

export function getAllCourses() {
    return allCoursesCache ?? [];
}

export function getCourseById(id) {
    return getCourses().find((c) => c.id === id);
}

export function getEnrolledCourseIds() {
    return enrolledIdsCache ?? [];
}

export function isEnrolledIn(courseId) {
    return getEnrolledCourseIds().includes(courseId);
}

export function useCoursePageData(studentId, country) {
    // Get country synchronously from localStorage to avoid race conditions
    const getInitialCountry = () => {
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

    const [courses, setCourses] = useState(() => coursesCache ?? []);
    const [enrolledIds, setEnrolledIds] = useState(() => enrolledIdsCache ?? []);
    const [myCourses, setMyCourses] = useState(() => myCoursesCache ?? []);
    const [allCourses, setAllCourses] = useState(() => allCoursesCache ?? []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Get country synchronously during initialization
    const [effectiveCountry, setEffectiveCountry] = useState(() => getInitialCountry());

    const refetch = useCallback(async (countryToUse) => {
        setLoading(true);
        setError(null);
        try {
            // Use provided country or fall back to initial country
            const countryParam = countryToUse ?? effectiveCountry ?? country;
            
            const result = await fetchCoursePageData(studentId, countryParam);
            
            setCourses(result.courses);
            setEnrolledIds(result.enrolledIds);
            setMyCourses(result.myCourses);
            setAllCourses(result.allCourses);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to load courses";
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
    studentId,
    courseCode,
    contentType
) {
    const url = `${API_AUTH_BASE}${COURSE_PATHS.getCourseContent(studentId, courseCode, contentType)}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;
    
    const headers = {
        "Accept": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Failed to fetch course content: ${res.status}`);
        const json = await res.json();
        
        const o = json && typeof json === "object" ? json : {};
        const data = getFirst(o, "data", "result") ?? [];
        
        return data.map(item => ({
            ...item,
            id: String(item.id),
        }));
    } catch (err) {
        return [];
    }
}

// Hook for fetching course content
export function useCourseContent(studentId, courseCode, contentType) {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
