import { API_BASE_URL, BACKEND_BASE_URL as CONST_BACKEND_BASE_URL, STORAGE_KEYS } from '../utils/constants';

const BASE_URL = API_BASE_URL;
export const BACKEND_BASE_URL = CONST_BACKEND_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const json = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && (errorData.message || errorData.error)) {
        errorMessage = errorData.message || errorData.error;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Students API
export const getStudents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/students${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getStudentById = async (studentId) => {
  return fetch(`${BASE_URL}/admin/students/${studentId}`, { headers: getAuthHeaders() }).then(json);
};
export const updateStudentData = async (studentId, studentData) => {
  const formData = new FormData();
  Object.keys(studentData).forEach(key => {
    if (studentData[key] !== null && studentData[key] !== undefined) {
      if (key === 'profileImage' && studentData[key] instanceof File) {
        formData.append('profileImage', studentData[key]);
      } else {
        formData.append(key, studentData[key]);
      }
    }
  });

  return fetch(`${BASE_URL}/admin/students/${studentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
}

export const updateStudentStatus = async (studentId, status) => {
  return fetch(`${BASE_URL}/admin/students/${studentId}/status`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(json);
};

export const getStudentCount = async (status = null) => {
  const query = status ? `?status=${status}` : '';
  return fetch(`${BASE_URL}/admin/students/count${query}`, { headers: getAuthHeaders() }).then(json);
};

export const getTeacherCount = async () => {
  return fetch(`${BASE_URL}/admin/teachers/count`, { headers: getAuthHeaders() }).then(json);
};

export const getParentCount = async () => {
  return fetch(`${BASE_URL}/admin/parents/count`, { headers: getAuthHeaders() }).then(json);
};

export const getCourseCount = async () => {
  return fetch(`${BASE_URL}/courses/count`, { headers: getAuthHeaders() }).then(json);
};

// Teachers API
export const getTeachers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/teachers${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTeacherById = async (teacherId) => {
  return fetch(`${BASE_URL}/admin/reports/${teacherId}`, { headers: getAuthHeaders() }).then(json);
};

export const updateTeacherStatus = async (teacherId, status) => {
  return fetch(`${BASE_URL}/admin/teachers/${teacherId}/status`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(json);
};

export const updateTeacherCourse = async (teacherId, coursename) => {
  return fetch(`${BASE_URL}/admin/teachers/${teacherId}/course`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ coursename }),
  }).then(json);
};

// Report APIs
export const getAllParentsReport = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/reports/parents${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getParentReportById = async (parentId) => {
  return fetch(`${BASE_URL}/admin/reports/parents/${parentId}`, { headers: getAuthHeaders() }).then(json);
};

export const getStudentReport = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/reports/students${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getStudentReportById = async (studentId) => {
  return fetch(`${BASE_URL}/admin/reports/students/${studentId}`, { headers: getAuthHeaders() }).then(json);
};

// Parents API
export const getParents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/parents${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const updateParentStatus = async (parentId, status) => {
  return fetch(`${BASE_URL}/admin/parents/${parentId}/status`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(json);
};

// Classes API
export const createClass = async (classData) => {
  return fetch(`${BASE_URL}/admin/classes`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(classData),
  }).then(json);
};

export const createSuperAdminClass = async (classData) => createClass(classData);

export const getSuperAdminClassSummary = async () => {
  const response = await fetch(`${BASE_URL}/admin/classes/summary`, {
    headers: getAuthHeaders(),
  });
  return json(response);
};

export const getSuperAdminClassHierarchy = async (classId) => {
  const response = await fetch(`${BASE_URL}/admin/classes/${classId}/hierarchy`, {
    headers: getAuthHeaders(),
  });
  return json(response);
};

export const getSuperAdminSubjectCourses = async (subjectCode) => {
  const response = await fetch(`${BASE_URL}/admin/subjects/${encodeURIComponent(subjectCode)}/courses`, {
    headers: getAuthHeaders(),
  });
  return json(response);
};

export const getSuperAdminCourseParticipants = async (courseCode) => {
  const response = await fetch(`${BASE_URL}/admin/courses/${encodeURIComponent(courseCode)}/participants`, {
    headers: getAuthHeaders(),
  });
  return json(response);
};

export const getCourseByCode = async (courseCode) => {
  const response = await fetch(`${BASE_URL}/courses/${encodeURIComponent(courseCode)}`, {
    headers: getAuthHeaders(),
  });
  return json(response);
};

export const updateSuperAdminCourse = async (courseCode, payload) => {
  const response = await fetch(`${BASE_URL}/admin/courses/${encodeURIComponent(courseCode)}`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return json(response);
};

export const getAllClasses = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/classes${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const editClass = async (id, classData) => {
  return fetch(`${BASE_URL}/admin/classes/${id}`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(classData),
  }).then(json);
};

export const deleteClass = async (id) => {
  return fetch(`${BASE_URL}/admin/classes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(json);
};

export const updateClassStatus = async (id, status) => {
  return fetch(`${BASE_URL}/admin/classes/${id}/status`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(json);
};

// Subjects API
export const createSubject = async (subjectData) => {
  return fetch(`${BASE_URL}/admin/subjects`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(subjectData),
  }).then(json);
};

export const getAllSubjects = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/subjects${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const editSubject = async (subjectCode, subjectData) => {
  return fetch(`${BASE_URL}/admin/subjects/${subjectCode}`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(subjectData),
  }).then(json);
};

export const deleteSubject = async (subjectCode) => {
  return fetch(`${BASE_URL}/admin/subjects/${subjectCode}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(json);
};

export const updateSubjectStatus = async (subjectCode, status) => {
  return fetch(`${BASE_URL}/admin/subjects/${subjectCode}/status`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(json);
};
export const createCourse = async (courseData) => {
  const formData = new FormData();

  Object.keys(courseData).forEach(key => {
    if (courseData[key] !== null && courseData[key] !== undefined) {
      if (key === 'thumbnail' && courseData[key] instanceof File) {
        formData.append('thumbnail', courseData[key]);
      } else if (key === 'introVideo' && courseData[key] instanceof File) {
        formData.append('introVideo', courseData[key]);
      } else {
        formData.append(key, courseData[key]);
      }
    }
  });

  return fetch(`${BASE_URL}/courses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};
export const getAllCourses = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/courses${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};
export const editCourse = async (courseCode, courseData) => {
  const formData = new FormData();

  Object.keys(courseData).forEach(key => {
    if (courseData[key] !== null && courseData[key] !== undefined) {
      if (key === 'thumbnail' && courseData[key] instanceof File) {
        formData.append('thumbnail', courseData[key]);
      } else if (key === 'introVideo' && courseData[key] instanceof File) {
        formData.append('introVideo', courseData[key]);
      } else {
        formData.append(key, courseData[key]);
      }
    }
  });

  return fetch(`${BASE_URL}/courses/${courseCode}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};
export const deleteCourse = async (courseCode) => {
  return fetch(`${BASE_URL}/courses/${courseCode}`, {
  method: "DELETE",
  headers: getAuthHeaders(),
  }).then(json);
};
export const updateCourseStatus = async (courseCode, status) => {
  return fetch(`${BASE_URL}/courses/${courseCode}/status`, {
  method: "PUT",
  headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  body: JSON.stringify({ status }),
  }).then(json);
};

export const getCourseById = async (courseCode) => {
  return fetch(`${BASE_URL}/courses/${courseCode}`, { headers: getAuthHeaders() }).then(json);
};

// Enrollments API
export const createEnrollment = async (enrollmentData) => {
  return fetch(`${BASE_URL}/admin/enrollments`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(enrollmentData),
  }).then(json);
};

export const getAllEnrollments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/enrollments${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getEnrollmentById = async (enrollmentCode) => {
  return fetch(`${BASE_URL}/admin/enrollments/${enrollmentCode}`, { headers: getAuthHeaders() }).then(json);
};

export const updateEnrollment = async (enrollmentCode, updateData) => {
  return fetch(`${BASE_URL}/admin/enrollments/${enrollmentCode}`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  }).then(json);
};

export const deleteEnrollment = async (enrollmentCode) => {
  return fetch(`${BASE_URL}/admin/enrollments/${enrollmentCode}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(json);
};

export const getEnrollmentCount = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/count`, { headers: getAuthHeaders() }).then(json);
};

export const getEnrollmentCountThisMonth = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/count/month`, { headers: getAuthHeaders() }).then(json);
};

export const getEnrollmentCountThisWeek = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/count/week`, { headers: getAuthHeaders() }).then(json);
};

export const getEnrollmentCountByCourse = async (courseCode) => {
  return fetch(`${BASE_URL}/admin/enrollments/count/course/${courseCode}`, { headers: getAuthHeaders() }).then(json);
};

export const getEnrollmentDataThisWeek = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/data/week`, { headers: getAuthHeaders() }).then(json);
};

export const getEnrollmentDataThisMonth = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/data/month`, { headers: getAuthHeaders() }).then(json);
};

export const getSalesDataThisWeek = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/sales/week`, { headers: getAuthHeaders() }).then(json);
};

export const getSalesDataThisMonth = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/sales/month`, { headers: getAuthHeaders() }).then(json);
};

export const getTotalSalesThisMonth = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/sales/total/month`, { headers: getAuthHeaders() }).then(json);
};

export const getTotalSalesThisWeek = async () => {
  return fetch(`${BASE_URL}/admin/enrollments/sales/total/week`, { headers: getAuthHeaders() }).then(json);
};

export const updateTeacherIdInEnrollments = async (teacherId, studentIds = null, courseCode = null) => {
  return fetch(`${BASE_URL}/admin/enrollments/update-teacher`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId, studentIds, courseCode }),
  }).then(json);
};

export const getEnrollmentsByCourseCode = async (courseCode, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/enrollments/course/${courseCode}${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getEnrollmentCountByTeacherId = async (teacherId) => {
  return fetch(`${BASE_URL}/admin/enrollments/count/teacher/${teacherId}`, { headers: getAuthHeaders() }).then(json);
};

export const getEnrollmentsByTeacherId = async (teacherId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/enrollments/teacher/${teacherId}${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Dashboard API
export const getDashboardStats = async () => {
  return fetch(`${BASE_URL}/admin/dashboard/stats`, { headers: getAuthHeaders() }).then(json);
};

// Banner API
export const addBanner = async (bannerData) => {
  const formData = new FormData();
  Object.keys(bannerData).forEach(key => {
    if (bannerData[key] !== null && bannerData[key] !== undefined) {
      if (key === 'image' && bannerData[key] instanceof File) {
        formData.append('image', bannerData[key]);
      } else {
        formData.append(key, bannerData[key]);
      }
    }
  });

  return fetch(`${BASE_URL}/banners`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};

export const getBanners = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/banners${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const deleteBanner = async (bannerId) => {
  return fetch(`${BASE_URL}/banners/${bannerId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(json);
};

export const getBannerCount = async () => {
  return fetch(`${BASE_URL}/banners/count`, { headers: getAuthHeaders() }).then(json);
};

// Content API
export const getAllContent = async () => {
  return fetch(`${BASE_URL}/content`, { headers: getAuthHeaders() }).then(json);
};

export const getContentByKey = async (key) => {
  return fetch(`${BASE_URL}/content/key/${key}`, { headers: getAuthHeaders() }).then(json);
};

export const createOrUpdateContent = async (contentData) => {
  return fetch(`${BASE_URL}/content/key`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(contentData),
  }).then(json);
};

export const updateContentByKey = async (key, contentData) => {
  return fetch(`${BASE_URL}/content/key/${key}`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(contentData),
  }).then(json);
};

export const deleteContentByKey = async (key) => {
  return fetch(`${BASE_URL}/content/key/${key}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(json);
};

// Contact Us API
export const getAllContacts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/contactus${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const deleteContact = async (contactId) => {
  return fetch(`${BASE_URL}/contactus/${contactId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(json);
};

export const sendReply = async (contactId, replyMessage) => {
  return fetch(`${BASE_URL}/contactus/${contactId}/reply`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ replyMessage }),
  }).then(json);
};

// Auth API
export const resendForgotPasswordOtp = async (identifier, role) => {
  return fetch(`${BASE_URL}/resend-forgot-password-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, role }),
  }).then(json);
};

// Subscriptions API
export const createSubscription = async (subscriptionData) => {
  return fetch(`${BASE_URL}/admin/subscriptions`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(subscriptionData),
  }).then(json);
};

export const getAllSubscriptions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/subscriptions${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getSubscriptionById = async (id) => {
  return fetch(`${BASE_URL}/admin/subscriptions/${id}`, { headers: getAuthHeaders() }).then(json);
};

export const updateSubscription = async (id, subscriptionData) => {
  return fetch(`${BASE_URL}/admin/subscriptions/${id}`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(subscriptionData),
  }).then(json);
};

export const deleteSubscription = async (id) => {
  return fetch(`${BASE_URL}/admin/subscriptions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(json);
};

// Subscription Buyed APIs
export const getSubscriptionsByTeacherId = async (teacherId) => {
  return fetch(`${BASE_URL}/admin/subscriptions/buyed/teacher/${teacherId}`, { headers: getAuthHeaders() }).then(json);
};

export const getSubscriptionBuyedById = async (id) => {
  return fetch(`${BASE_URL}/admin/subscriptions/buyed/${id}`, { headers: getAuthHeaders() }).then(json);
};

export const getAllSubscriptionsBuyed = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/subscriptions/buyed/all${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Payouts API
export const createPayment = async (paymentData) => {
  return fetch(`${BASE_URL}/admin/payouts`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  }).then(json);
};

export const getAllPayments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/payouts${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getPaymentById = async (id) => {
  return fetch(`${BASE_URL}/admin/payouts/${id}`, { headers: getAuthHeaders() }).then(json);
};

// Broadcast API
export const sendBroadcast = async (broadcastData) => {
  return fetch(`${BASE_URL}/admin/notifications/broadcast`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(broadcastData),
  }).then(json);
};

// Notifications API
export const deleteNotification = async (notificationId) => {
  const url = `${BASE_URL}/admin/notifications/${notificationId}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

export const getNotificationBySuperAdminId = async () => {
  const url = `${BASE_URL}/admin/notifications/notifications`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const deleteAllNotificationBySuperAdmin = async () => {
  const url = `${BASE_URL}/admin/notifications/notifications/all`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

// Syllabus API
export const getSyllabus = async (courseCode) => {
  try {
    const response = await fetch(`${BASE_URL}/syllabus/${courseCode}`, { 
      headers: getAuthHeaders() 
    });
    const result = await response.json();
    return { data: result.data };
  } catch (error) {
    throw error;
  }
};

export const addUpdateSyllabusFile = async (formData) => {
  return fetch(`${BASE_URL}/syllabus`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};

export const updateSyllabusBullets = async (courseCode, points) => {
  return fetch(`${BASE_URL}/syllabus/${courseCode}/bullet-points`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ points }),
  }).then(json);
};

// Profile API
export const getSuperAdminProfile = async () => {
  return fetch(`${BASE_URL}/admin/profile`, {
    headers: getAuthHeaders(),
  }).then(json);
};

export const updateSuperAdminProfile = async (formData) => {
  return fetch(`${BASE_URL}/admin/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};
