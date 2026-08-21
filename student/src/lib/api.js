/**
 * Standard API Configuration
 * Uses environment variables for dev & production.
 */

export const API_BASE = import.meta.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
  coursePageData: (studentId, country, page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (country) params.append("country", country);
    return `/api/student/coursepagedata/${studentId}?${params.toString()}`;
  },

  getCoursesBySubject: (studentId, subjectCode, country, page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (country) params.append("country", country);
    return `/api/student/coursepagedata/${studentId}/subject/${subjectCode}?${params.toString()}`;
  },

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

    return `/api/student/coursepagedata/${studentId}/${courseCode}/content${
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
    return `/api/student/home/${studentId}${query ? `?${query}` : ""}`;
  },
};

export const STUDENT_PATHS = {
  getLiveSessions: (studentId, status, page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);
    return `/api/student/getlive-sessions/${studentId}?${params.toString()}`;
  },
};

export const CREATE_DOUBT = {
  createDoubt: `/api/student/doubts`,
};

export const GET_DOUBT = {
  getDoubt: (studentId, page = 1, limit = 10) =>
    `/api/student/doubts/student/${studentId}?page=${page}&limit=${limit}`,
};

export const EDITPROFILE = {
  editprofile: (studentId) => `/api/student/${studentId}`,
};

export const GETPROFILE = {
  getprofile: (studentId) => `/api/student/${studentId}`,
};

export const GETCONTENT = {
  getcontent: `/api/content`,
};

export const ENROLLMENT_PATHS = {
  getEnrollmentsByStudent: (studentId, page = 1, limit = 10) =>
    `/api/student/enrollments/student/${studentId}?page=${page}&limit=${limit}`,
  createCashfreeOrder: "/api/student/enrollments/create-cashfree-order",
  verifyCashfreeOrder: (orderId) => `/api/student/enrollments/verify-cashfree-order/${orderId}`,
};

export const NOTIFICATION_PATHS = {
  getNotifications: (studentId, page = 1, limit = 10) =>
    `/api/student/notifications/student/${studentId}?page=${page}&limit=${limit}`,
  deleteNotification: (notificationId) =>
    `/api/student/notifications/student/${notificationId}`,
  clearAllNotifications: (studentId) =>
    `/api/student/notifications/student/${studentId}/all`,
};

export const LIVESESSION_PATHS = {
  joinSession: "/api/livesessions/join",
};

export const ASSIGNMENT_PATHS = {
  getAssignmentsByStudent: (studentId, page = 1, limit = 10) =>
    `/api/student/assignments/student/${studentId}?page=${page}&limit=${limit}`,
  submitAssignment: "/api/student/assignments/students/submission",
};

export const PROGRESS_PATHS = {
  getProgress: (studentId) => `/api/student/${studentId}/progress`,
};

export const TEST_PATHS = {
  getTestsByStudent: (studentId, page = 1, limit = 10) =>
    `/api/student/tests/student/${studentId}?page=${page}&limit=${limit}`,
  submitTest: "/api/student/tests/submit",
};
