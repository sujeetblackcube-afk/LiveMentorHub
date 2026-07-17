/**
 * Standard API Configuration
 * Uses environment variables for dev & production.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE as string;

if (!API_BASE) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE is not defined in environment variables.",
  );
}

export const API_AUTH_BASE = API_BASE;
export const API_FORGOT_PASSWORD_BASE = API_BASE;

export const AUTH_PATHS = {
  login: "/api/auth/login",
  registerStudent: "/api/auth/register/student",
  verifyOtp: "/api/auth/verify-otp",
  resendOtp: "/api/auth/resend-otp",
} as const;

export const FORGOT_PASSWORD_PATHS = {
  forgotPassword: "/api/auth/forgot-password",
  verifyForgotPasswordOtp: "/api/auth/verify-forgot-password-otp",
  resetPassword: "/api/auth/reset-password",
} as const;

export const COURSE_PATHS = {
  coursePageData: (studentId: string, country?: string) =>
    `/api/android/coursepagedata/${studentId}${
      country ? `?country=${encodeURIComponent(country)}` : ""
    }`,

  getCoursesBySubject: (studentId: string, subjectCode: string, country?: string) =>
    `/api/android/coursepagedata/${studentId}/subject/${subjectCode}${
      country ? `?country=${encodeURIComponent(country)}` : ""
    }`,

  getCourseContent: (
    studentId: string,
    courseCode: string,
    contentType?: string,
    country?: string,
  ) => {
    const params = new URLSearchParams();

    if (contentType) params.append("contentType", contentType);
    if (country) params.append("country", country);

    const query = params.toString();

    return `/api/android/coursepagedata/${studentId}/${courseCode}/content${
      query ? `?${query}` : ""
    }`;
  },
} as const;

export const HOME_PATHS = {
  homeData: (studentId: string, courseType?: string, country?: string) => {
    const params = new URLSearchParams();

    if (courseType) params.append("courseType", courseType);
    if (country) params.append("country", country);

    const query = params.toString();
    return `/api/android/home/${studentId}${query ? `?${query}` : ""}`;
  },
} as const;

export const STUDENT_PATHS = {
  getLiveSessions: (studentId: string, status?: string) => {
    const base = `/api/students/getlive-sessions/${studentId}`;
    return status ? `${base}?status=${status}` : base;
  },
} as const;

export const CREATE_DOUBT = {
  createDoubt: `/api/doubts`,
} as const;

export const GET_DOUBT = {
  getDoubt: (studentId: string) => `/api/doubts/student/${studentId}`,
} as const;

export const EDITPROFILE = {
  editprofile: (studentId: string) => `/api/students/${studentId}`,
} as const;

export const GETPROFILE = {
  getprofile: (studentId: string) => `/api/students/${studentId}`,
} as const;

export const GETCONTENT = {
  getcontent: `/api/content`,
} as const;

export const ENROLLMENT_PATHS = {
  getEnrollmentsByStudent: (studentId: string) =>
    `/api/enrollments/student/${studentId}`,
  createCashfreeOrder: "/api/enrollments/create-cashfree-order",
} as const;

export const NOTIFICATION_PATHS = {
  getNotifications: (studentId: string) =>
    `/api/notifications/student/${studentId}`,
  deleteNotification: (notificationId: string) =>
    `/api/notifications/${notificationId}`,
  clearAllNotifications: (studentId: string) =>
    `/api/notifications/student/all/${studentId}`,
} as const;

export const LIVESESSION_PATHS = {
  joinSession: "/api/livesessions/join",
} as const;

export const ASSIGNMENT_PATHS = {
  getAssignmentsByStudent: (studentId: string) =>
    `/api/assignments/student/${studentId}`,
  submitAssignment: "/api/assignments/students/submission",
} as const;

export const PROGRESS_PATHS = {
  getProgress: (studentId: string) => `/api/students/${studentId}/progress`,
} as const;

export const TEST_PATHS = {
  getTestsByStudent: (studentId: string) => `/api/tests/student/${studentId}`,
  submitTest: "/api/tests/submit",
} as const;
