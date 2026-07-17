"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { Footer } from "@/components/layout/Footer";
import { API_AUTH_BASE, COURSE_PATHS } from "@/lib/api";
import CourseCard from "@/components/CourseCard";

interface CourseFromApi {
  courseCode: string;
  courseName: string;
  id: number;
  courseType: string;
  rating: number;
  courseDescription: string;
  thumbnail: string;
  difficulty: string;
  mrp: string;
  discountedprice: string;
  status: string;
  totalenrollment: number;
  deadline: string;
  courseStartDate: string;
  courseDuration: number;
  board: string;
  medium: string;
  classname: string;
  subject: string;
  subjectCode: string;
  stream: string;
  category: string;
  subcategory: string;
  targetAudience: string;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
  convertedMrp: string;
  convertedDiscountedPrice: string;
  formattedMrp: string;
  formattedDiscountedPrice: string;
  currencyCode: string;
  currencySymbol: string;
  enrollmentStatus: number;
}

// Convert API response to CourseCard format
const mapApiCourseToCard = (course: CourseFromApi, currencySymbol: string) => {
  // Use converted prices from API (country-specific) - prioritize these
  const price = parseFloat(course.convertedDiscountedPrice) || parseFloat(course.formattedDiscountedPrice) || 0;
  const originalPrice = parseFloat(course.convertedMrp) || parseFloat(course.formattedMrp) || price || 999;

  return {
    id: course.courseCode,
    title: course.courseName,
    thumbnail: course.thumbnail ? `${API_AUTH_BASE}/${course.thumbnail.replace(/^\/+/, "")}` : "",
    instructor: "",
    price: price,
    originalPrice: originalPrice,
    rating: course.rating || 0,
    students: course.totalenrollment || 0,
    duration: course.courseDuration ? `${course.courseDuration}` : "",
    level: course.difficulty,
    description: course.courseDescription,
    category: course.category,
    courseType: course.courseType,
    board: course.board,
    classname: course.classname,
    subject: course.subject,
    medium: course.medium,
    totalLessons: course.totalLessons,
    difficulty: course.difficulty,
    currencySymbol: currencySymbol,
  };
};

export default function ExploreSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const className = params.className as string;
  const subjectName = params.subjectName as string;
  
  const [rawCourses, setRawCourses] = useState<CourseFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("د.إ");
  const [error, setError] = useState<string | null>(null);

  // Get studentId and country using same approach as CoursesPage
  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [country, setCountry] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Get studentId from multiple sources - same as CoursesPage
    let id: string | undefined;
    let countryValue: string | undefined;
    
    // Try localStorage first
    if (typeof window !== "undefined") {
      id = localStorage.getItem("studentId") || undefined;
      countryValue = localStorage.getItem("country") || undefined;
      
      // Also try to get from auth-storage if available
      if (!id || !countryValue) {
        try {
          const authData = localStorage.getItem("auth-storage");
          if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.state?.user?.studentId) {
              id = parsed.state.user.studentId;
            }
            if (parsed.state?.user?.country) {
              countryValue = parsed.state.user.country;
            }
          }
        } catch (e) {
          // Silent fail
        }
      }
    }
    
    setStudentId(id);
    setCountry(countryValue);
  }, []);

  // Convert courses with enrollment status
  const courses = useMemo(() => {
    return rawCourses.map(course => ({
      ...mapApiCourseToCard(course, currencySymbol),
      enrollmentStatus: course.enrollmentStatus
    }));
  }, [rawCourses, currencySymbol]);

  // Fetch courses when studentId or params change
  useEffect(() => {
    if (studentId) {
      fetchCourses();
    }
  }, [className, subjectName, studentId, country]);

  const fetchCourses = async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Get country from state (with fallback to UAE if not set)
      const countryParam = country || "UAE";

      // Get subject code from URL parameter
      const subjectCode = params.subjectName as string;

      // Use the API path function that now includes country parameter
      const url = `${API_AUTH_BASE}${COURSE_PATHS.getCoursesBySubject(studentId, subjectCode, countryParam)}`;

      const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;

      const res = await axios.get(url, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });

      if (res.data?.success) {
        const coursesData = res.data.data || [];
        setRawCourses(coursesData);
        if (res.data.currencyInfo?.symbol) {
          setCurrencySymbol(res.data.currencyInfo.symbol);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load courses");
      setRawCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Also trigger fetch when country changes
  useEffect(() => {
    if (studentId && country) {
      fetchCourses();
    }
  }, [country]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Class {className} - {subjectName.charAt(0).toUpperCase() + subjectName.slice(1)}
          </h1>
          <p className="text-sm text-gray-500">
            {courses.length} course{courses.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <span className="ml-3 text-gray-500 text-lg">Loading courses...</span>
        </div>
      ) : error ? (
        <div className="text-center py-24">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={course.enrollmentStatus === 1}
              href={`/courses/${course.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-gray-500 text-lg">No courses available for this subject.</p>
        </div>
      )}

     
    </div>
  );
}

