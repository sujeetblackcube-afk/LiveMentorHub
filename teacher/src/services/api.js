const envBase = (import.meta.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
const BASE_URL = `${envBase}/api`;
export const TEACHER_BASE_URL = `${BASE_URL}/teacher`;
export const BACKEND_BASE_URL = envBase; // For static files

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
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

export const getBanners = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/banners${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTeacherCourseStudents = async (courseCode, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${TEACHER_BASE_URL}/courses/${courseCode}/students${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getAllTeacherStudentsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${TEACHER_BASE_URL}/students${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTeacherCourses = async (params = {}) => {
  let queryString = "";
  if (typeof params === "string") {
    queryString = `?teacherId=${params}`;
  } else if (params && typeof params === "object") {
    const searchParams = new URLSearchParams(params);
    queryString = searchParams.toString();
    if (queryString) queryString = `?${queryString}`;
  }
  const url = `${TEACHER_BASE_URL}/courses${queryString}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTotalStudentCountForTeacher = async () => {
  const url = `${TEACHER_BASE_URL}/total-students`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTeacherHomescreenData = async (teacherId) => {
  const queryString = teacherId ? `/${teacherId}` : "";
  const url = `${TEACHER_BASE_URL}/homescreenData${queryString}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const createLiveSession = async (sessionData) => {
  const url = `${TEACHER_BASE_URL}/livesessions`;
  return fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: sessionData,
  }).then(json);
};

// Bulk create live sessions (for weekly/monthly scheduling)
export const createBulkLiveSessions = async (bulkData) => {
  const url = `${TEACHER_BASE_URL}/livesessions`;
  return fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: bulkData,
  }).then(json);
};

export const updateLiveSession = async (sessionId, sessionData) => {
  const url = `${TEACHER_BASE_URL}/livesessions/${sessionId}`;
  return fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: sessionData,
  }).then(json);
};

export const deleteLiveSession = async (sessionId, teacherId) => {
  const url = `${TEACHER_BASE_URL}/livesessions/${sessionId}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teacherId }),
  }).then(json);
};

// Get live sessions for a specific teacher
export const getTeacherLiveSessions = async (teacherId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${TEACHER_BASE_URL}/${teacherId}/livesessions${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const startLiveSession = async (sessionId, teacherId) => {
  const url = `${TEACHER_BASE_URL}/livesessions/start`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, teacherId }),
  }).then(json);
};

export const joinLiveSession = async (sessionId, studentId) => {
  const url = `${TEACHER_BASE_URL}/livesessions/join`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, studentId }),
  }).then(json);
};

export const getTeacherCourseCount = async (teacherId) => {
  const url = `${TEACHER_BASE_URL}/${teacherId}/coursecount`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getcountLiveClassesByTeacher = async (teacherId) => {
  const url = `${TEACHER_BASE_URL}/livesessions/teacher/${teacherId}/total`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const addNotes = async (formData) => {
  const url = `${TEACHER_BASE_URL}/notes`;
  return fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};

export const getNotes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${TEACHER_BASE_URL}/notes${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const deleteNote = async (id) => {
  const url = `${TEACHER_BASE_URL}/notes/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

export const editNote = async (id, data) => {
  const url = `${TEACHER_BASE_URL}/notes/${id}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(json);
};

export const getNotesCount = async (teacherId) => {
  const url = `${TEACHER_BASE_URL}/notes/count?teacherId=${teacherId}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const createDoubt = async (doubtData) => {
  const url = `${TEACHER_BASE_URL}/doubts`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(doubtData),
  }).then(json);
};

export const updateDoubt = async (id, updateData) => {
  const url = `${TEACHER_BASE_URL}/doubts/${id}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  }).then(json);
};

export const getDoubtsByTeacherId = async (teacherId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${TEACHER_BASE_URL}/doubts/${teacherId}${query ? `?${query}` : ""}`;
  const result = await fetch(url, { headers: getAuthHeaders() }).then(json);
  return result;
};

export const createAssignment = async (teacherId, courseCode, data, file) => {
  const url = `${TEACHER_BASE_URL}/assignments/${teacherId}`;
  const formData = new FormData();
  formData.append('courseCode', courseCode);
  formData.append('teacherId', teacherId);
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('dueDate', data.dueDate);
  formData.append('totalMarks', data.totalMarks);
  if (file) formData.append('file', file);
  return fetch(url, { method: 'POST', headers: getAuthHeaders(), body: formData }).then(json);
};

export const getAssignments = async (teacherId, courseCode = null, params = {}) => {
  const queryObj = { teacherId };
  if (courseCode) queryObj.courseCode = courseCode;
  if (params.page) queryObj.page = params.page;
  if (params.limit) queryObj.limit = params.limit;
  const query = new URLSearchParams(queryObj).toString();
  const url = `${TEACHER_BASE_URL}/assignments?${query}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getAssignmentById = async (id) => {
  const url = `${TEACHER_BASE_URL}/assignments/${id}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const updateAssignment = async (id, assignmentData, file = null) => {
  const url = `${TEACHER_BASE_URL}/assignments/${id}`;
  
  const formData = new FormData();
  if (assignmentData.title !== undefined) formData.append('title', assignmentData.title);
  if (assignmentData.description !== undefined) formData.append('description', assignmentData.description);
  if (assignmentData.dueDate !== undefined) formData.append('dueDate', assignmentData.dueDate);
  if (assignmentData.totalMarks !== undefined) formData.append('totalMarks', assignmentData.totalMarks);
  
  if (file) {
    formData.append('file', file);
  }
  
  return fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};

export const deleteAssignment = async (id) => {
  const url = `${TEACHER_BASE_URL}/assignments/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

export const getAssignmentOfStudentByTeacher = async (teacherId, status = null, params = {}) => {
  const queryObj = { ...params };
  if (status) queryObj.status = status;
  const query = new URLSearchParams(queryObj).toString();
  const url = `${TEACHER_BASE_URL}/assignments/teacher/${teacherId}${query ? `?${query}` : ''}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const updateSubmissionMarksAndFeedback = async (submissionId, data) => {
  const url = `${TEACHER_BASE_URL}/assignments/teacher/submission/${submissionId}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(json);
};

// ============== QUESTION API FUNCTIONS ==============

export const createQuestion = async (questionData) => {
  const url = `${TEACHER_BASE_URL}/questions`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  }).then(json);
};

export const getAllQuestions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${TEACHER_BASE_URL}/questions${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getQuestionById = async (id) => {
  const url = `${TEACHER_BASE_URL}/questions/${id}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const updateQuestion = async (id, questionData) => {
  const url = `${TEACHER_BASE_URL}/questions/${id}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  }).then(json);
};

export const deleteQuestion = async (id) => {
  const url = `${TEACHER_BASE_URL}/questions/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

export const createQuestionsFromExcel = async (teacherId, file) => {
  const url = `${TEACHER_BASE_URL}/questions/excel`;
  const formData = new FormData();
  formData.append('teacherId', teacherId);
  formData.append('file', file);
  return fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};

// ============== TEST API FUNCTIONS ==============

export const createTest = async (testData) => {
  const url = `${TEACHER_BASE_URL}/tests`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  }).then(json);
};

export const getAllTests = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${TEACHER_BASE_URL}/tests${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTestById = async (id) => {
  const url = `${TEACHER_BASE_URL}/tests/${id}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getAllTestsByCourseCode = async (courseCode) => {
  const url = `${TEACHER_BASE_URL}/tests/course/${encodeURIComponent(courseCode)}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const updateTest = async (id, testData) => {
  const url = `${TEACHER_BASE_URL}/tests/${id}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  }).then(json);
};

export const deleteTest = async (id) => {
  const url = `${TEACHER_BASE_URL}/tests/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

export const getTeacherTestSubmissions = async (teacherId) => {
  const url = `${TEACHER_BASE_URL}/tests/${teacherId}/test-submissions`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const updateTestSubmissionMarks = async (submissionId, data) => {
  const url = `${TEACHER_BASE_URL}/tests/grade-submission/${submissionId}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(json);
};

// ============== SUBSCRIPTION API FUNCTIONS ==============

export const getAllSubscriptions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${TEACHER_BASE_URL}/subscriptions${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const createSubscriptionBuyed = async (teacherId, data) => {
  const url = `${TEACHER_BASE_URL}/subscriptions/buyed/${teacherId}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(json);
};

export const createSubscriptionCashfreeOrder = async (payload) => {
  const url = `${TEACHER_BASE_URL}/subscriptions/create-cashfree-order`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(json);
};

export const verifySubscriptionCashfreeOrder = async (orderId) => {
  const url = `${TEACHER_BASE_URL}/subscriptions/verify-cashfree-order/${orderId}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  }).then(json);
};

export const getSubscriptionsByTeacherId = async (teacherId) => {
  const queryString = teacherId ? `/${teacherId}` : "";
  const url = `${TEACHER_BASE_URL}/subscriptions/my-subscriptions${queryString}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// ============== PAYOUT API FUNCTIONS ==============

export const getTotalEarningsByTeacher = async () => {
  const url = `${TEACHER_BASE_URL}/payouts/earning`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTeacherPayoutTransactions = async (status = null, params = {}) => {
  const queryObj = { ...params };
  if (status && status !== 'all') {
    queryObj.status = status;
  }
  const query = new URLSearchParams(queryObj).toString();
  const url = `${TEACHER_BASE_URL}/payouts/transactions${query ? `?${query}` : ''}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// ============== CONTACT US API FUNCTIONS ==============

export const createContact = async (contactData) => {
  const url = `${BASE_URL}/contactus`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  }).then(json);
};

// ============== NOTIFICATION API FUNCTIONS ==============

export const getNotificationByTeacherId = async () => {
  const url = `${TEACHER_BASE_URL}/notifications`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const deleteAllNotificationByTeacher = async () => {
  const url = `${TEACHER_BASE_URL}/notifications/all`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

export const deleteNotification = async (notificationId) => {
  const url = `${TEACHER_BASE_URL}/notifications/${notificationId}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};
