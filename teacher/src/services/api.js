//  const BASE_URL = "http://localhost:5000/api"; // Adjust if backend runs on different port
// // const BASE_URL = "http://16.171.61.121:5000/api"; // Adjust if backend runs on different port
  const BASE_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}/api`;
export const BACKEND_BASE_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}`; // For static files

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const json = async (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};
export const getBanners = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/banners${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};
export const getTeacherCourseStudents = async (courseCode) => {
  const url = `${BASE_URL}/teachers/courses/${courseCode}/students`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTeacherCourses = async () => {
  const url = `${BASE_URL}/teachers/courses`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getTotalStudentCountForTeacher = async () => {
  const url = `${BASE_URL}/teachers/total-students`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const createLiveSession = async (sessionData) => {
  const url = `${BASE_URL}/livesessions`;
  return fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: sessionData,
  }).then(json);
};

// Bulk create live sessions (for weekly/monthly scheduling)
export const createBulkLiveSessions = async (bulkData) => {
  const url = `${BASE_URL}/livesessions`;
  return fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: bulkData,
  }).then(json);
};

export const updateLiveSession = async (sessionId, sessionData) => {
  const url = `${BASE_URL}/livesessions/${sessionId}`;
  return fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: sessionData,
  }).then(json);
};

export const deleteLiveSession = async (sessionId, teacherId) => {
  const url = `${BASE_URL}/livesessions/${sessionId}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teacherId }),
  }).then(json);
};

// get live sessions for a specific teacher
export const getTeacherLiveSessions = async (teacherId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/teachers/${teacherId}/livesessions${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const startLiveSession = async (sessionId, teacherId) => {
  const url = `${BASE_URL}/livesessions/start`;
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
  const url = `${BASE_URL}/livesessions/join`;
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
  const url = `${BASE_URL}/teachers/${teacherId}/coursecount`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};
export  const  getcountLiveClassesByTeacher = async (teacherId) => {
  const url = `${BASE_URL}/livesessions/teacher/${teacherId}/total`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const addNotes = async (formData) => {
  const url = `${BASE_URL}/notes`;
  return fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  }).then(json);
};

export const getNotes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/notes${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const deleteNote = async (id) => {
  const url = `${BASE_URL}/notes/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

export const editNote = async (id, data) => {
  const url = `${BASE_URL}/notes/${id}`;
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
  const url = `${BASE_URL}/notes/count?teacherId=${teacherId}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const createDoubt = async (doubtData) => {
  const url = `${BASE_URL}/doubts`;
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
  const url = `${BASE_URL}/doubts/${id}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  }).then(json);
};

export const getDoubtsByTeacherId = async (teacherId) => {
  // console.log('getDoubtsByTeacherId called with teacherId:', teacherId);
  const url = `${BASE_URL}/doubts/${teacherId}`;
  // console.log('API URL:', url);
  const result = await fetch(url, { headers: getAuthHeaders() }).then(json);
  // console.log('API result:', result);
  return result;
};

export const createAssignment = async (teacherId, courseCode, data, file) => {
  // Backend route: POST /:teacherId - teacherId in URL path
  const url = `${BASE_URL}/assignments/${teacherId}`;
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

export const getAssignments = async (teacherId, courseCode = null) => {
  // Backend expects teacherId in query params based on controller
  let url = `${BASE_URL}/assignments?teacherId=${encodeURIComponent(teacherId)}`;
  if (courseCode) {
    url += `&courseCode=${encodeURIComponent(courseCode)}`;
  }
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const getAssignmentById = async (id) => {
  const url = `${BASE_URL}/assignments/${id}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const updateAssignment = async (id, assignmentData, file = null) => {
  const url = `${BASE_URL}/assignments/${id}`;
  
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
  const url = `${BASE_URL}/assignments/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

export const getAssignmentOfStudentByTeacher = async (teacherId, status = null) => {
  let url = `${BASE_URL}/assignments/teacher/${teacherId}`;
  if (status) {
    url += `?status=${encodeURIComponent(status)}`;
  }
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

export const updateSubmissionMarksAndFeedback = async (submissionId, data) => {
  const url = `${BASE_URL}/assignments/teacher/submission/${submissionId}`;
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

// Create a single question
export const createQuestion = async (questionData) => {
  const url = `${BASE_URL}/questions`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  }).then(json);
};

// Get all questions with optional filters
export const getAllQuestions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/questions${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Get question by ID
export const getQuestionById = async (id) => {
  const url = `${BASE_URL}/questions/${id}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Update a question
export const updateQuestion = async (id, questionData) => {
  const url = `${BASE_URL}/questions/${id}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  }).then(json);
};

// Delete a question
export const deleteQuestion = async (id) => {
  const url = `${BASE_URL}/questions/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

// Create questions from Excel file
export const createQuestionsFromExcel = async (teacherId, file) => {
  const url = `${BASE_URL}/questions/excel`;
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

// Create a new test
export const createTest = async (testData) => {
  const url = `${BASE_URL}/tests`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  }).then(json);
};

// Get all tests with optional filters
export const getAllTests = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/tests${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Get test by ID
export const getTestById = async (id) => {
  const url = `${BASE_URL}/tests/${id}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Get all tests by courseCode
export const getAllTestsByCourseCode = async (courseCode) => {
  const url = `${BASE_URL}/tests/course/${encodeURIComponent(courseCode)}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Update a test
export const updateTest = async (id, testData) => {
  const url = `${BASE_URL}/tests/${id}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  }).then(json);
};

// Delete a test
export const deleteTest = async (id) => {
  const url = `${BASE_URL}/tests/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

// Get test submissions for a specific teacher
export const getTeacherTestSubmissions = async (teacherId) => {
  const url = `${BASE_URL}/tests/${teacherId}/test-submissions`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Update marks and feedback for a specific test submission
export const updateTestSubmissionMarks = async (submissionId, data) => {
  const url = `${BASE_URL}/tests/grade-submission/${submissionId}`;
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

// Get all available subscriptions
export const getAllSubscriptions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/subscriptions${query ? `?${query}` : ""}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Create a new subscription buyed (purchase)
export const createSubscriptionBuyed = async (teacherId, data) => {
  const url = `${BASE_URL}/subscriptions/buyed/${teacherId}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(json);
};

// Cashfree: create order for subscription purchase
export const createSubscriptionCashfreeOrder = async (payload) => {
  const url = `${BASE_URL}/subscriptions/create-cashfree-order`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(json);
};

// Cashfree: verify order for subscription purchase
export const verifySubscriptionCashfreeOrder = async (orderId) => {
  const url = `${BASE_URL}/subscriptions/verify-cashfree-order/${orderId}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  }).then(json);
};

// Get all subscriptions buyed by teacher ID
export const getSubscriptionsByTeacherId = async (teacherId) => {
  const url = `${BASE_URL}/subscriptions/buyed/teacher/${teacherId}`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// ============== PAYOUT API FUNCTIONS ==============

// Get total earnings for the authenticated teacher
export const getTotalEarningsByTeacher = async () => {
  const url = `${BASE_URL}/payouts/earning`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Get all payout transactions for the authenticated teacher
export const getTeacherPayoutTransactions = async (status = null) => {
  let url = `${BASE_URL}/payouts/transactions`;
  if (status && status !== 'all') {
    url += `?status=${encodeURIComponent(status)}`;
  }
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// ============== CONTACT US API FUNCTIONS ==============

// Create a new contact message
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

// Get notifications for the authenticated teacher
export const getNotificationByTeacherId = async () => {
  const url = `${BASE_URL}/notifications/teacher/notifications`;
  return fetch(url, { headers: getAuthHeaders() }).then(json);
};

// Delete all notifications for the authenticated teacher
export const deleteAllNotificationByTeacher = async () => {
  const url = `${BASE_URL}/notifications/teacher/notifications/all`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};

// Delete a single notification by ID
export const deleteNotification = async (notificationId) => {
  const url = `${BASE_URL}/notifications/${notificationId}`;
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(json);
};



