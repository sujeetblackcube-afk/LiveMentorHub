/**
 * Standard API Configuration
 * Uses environment variables for dev & production.
 */

export const API_BASE = import.meta.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// if (!API_BASE) {
//   throw new Error(
//     "NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.",
//   );
// }

export const API_AUTH_BASE = API_BASE;
export const API_FORGOT_PASSWORD_BASE = API_BASE;

export const AUTH_PATHS = {
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  registerStudent: "/api/auth/register/student",
  verifyOtp: "/api/auth/verify-otp",
  resendOtp: "/api/auth/resend-otp",
};

export const FORGOT_PASSWORD_PATHS = {
  forgotPassword: "/api/auth/forgot-password",
  verifyForgotPasswordOtp: "/api/auth/verify-forgot-password-otp",
  resetPassword: "/api/auth/reset-password",
};

export const COURSE_PATHS = {
  coursePageData: (studentId, country) =>
    `/api/android/coursepagedata/${studentId}${
      country ? `?country=${encodeURIComponent(country)}` : ""
    }`,

  getCoursesBySubject: (studentId, subjectCode, country) =>
    `/api/android/coursepagedata/${studentId}/subject/${subjectCode}${
      country ? `?country=${encodeURIComponent(country)}` : ""
    }`,

  getCourseContent: (
    studentId,
    courseCode,
    contentType,
    country,
  ) => {
    const params = new URLSearchParams();

    if (contentType) params.append("contentType", contentType);
    if (country) params.append("country", country);

    const query = params.toString();

    return `/api/android/coursepagedata/${studentId}/${courseCode}/content${
      query ? `?${query}` : ""
    }`;
  },
};

export const HOME_PATHS = {
  homeData: (studentId, courseType, country) => {
    const params = new URLSearchParams();

    if (courseType) params.append("courseType", courseType);
    if (country) params.append("country", country);

    const query = params.toString();
    return `/api/android/home/${studentId}${query ? `?${query}` : ""}`;
  },
};

export const STUDENT_PATHS = {
  getLiveSessions: (studentId, status) => {
    const base = `/api/students/getlive-sessions/${studentId}`;
    return status ? `${base}?status=${status}` : base;
  },
};

export const CREATE_DOUBT = {
  createDoubt: `/api/doubts`,
};

export const GET_DOUBT = {
  getDoubt: (studentId) => `/api/doubts/student/${studentId}`,
};

export const EDITPROFILE = {
  editprofile: (studentId) => `/api/students/${studentId}`,
};

export const GETPROFILE = {
  getprofile: (studentId) => `/api/students/${studentId}`,
};

export const GETCONTENT = {
  getcontent: `/api/content`,
};

export const ENROLLMENT_PATHS = {
  getEnrollmentsByStudent: (studentId) =>
    `/api/enrollments/student/${studentId}`,
  createCashfreeOrder: "/api/enrollments/create-cashfree-order",
};

export const NOTIFICATION_PATHS = {
  getNotifications: (studentId) =>
    `/api/notifications/student/${studentId}`,
  deleteNotification: (notificationId) =>
    `/api/notifications/student/${notificationId}`,
  clearAllNotifications: (studentId) =>
    `/api/notifications/student/${studentId}/all`,
};

export const LIVESESSION_PATHS = {
  joinSession: "/api/livesessions/join",
};

export const ASSIGNMENT_PATHS = {
  getAssignmentsByStudent: (studentId) =>
    `/api/assignments/student/${studentId}`,
  submitAssignment: "/api/assignments/students/submission",
};

export const PROGRESS_PATHS = {
  getProgress: (studentId) => `/api/students/${studentId}/progress`,
};

export const TEST_PATHS = {
  getTestsByStudent: (studentId) => `/api/tests/student/${studentId}`,
  submitTest: "/api/tests/submit",
};
