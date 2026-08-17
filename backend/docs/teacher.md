# Teacher API Reference

This document is written for frontend and mobile developers so each endpoint is easy to copy, test, and integrate without guessing the request or response format.

## Conventions

- Base URL: http://localhost:5000
- Auth header: Authorization: Bearer <token>
- JSON requests: Content-Type: application/json
- File uploads: multipart/form-data
- Success response pattern:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

- Error response pattern:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

## 1) Teacher profile and general APIs

### 1.1 Get all teachers

- Method: GET
- Endpoint: /api/teachers
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers"
```

- Example response:

```json
{
  "status": true,
  "message": "Teachers fetched successfully",
  "data": [
    {
      "teacherId": "TCH_2001",
      "name": "Dr. Smith",
      "email": "smith@example.com",
      "mobile": "9876543210",
      "status": "APPROVED",
      "qualification": "M.Sc Mathematics",
      "createdAt": "2024-12-01T10:30:00.000Z"
    }
  ]
}
```

### 1.2 Get teacher count

- Method: GET
- Endpoint: /api/teachers/count
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/count"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "count": 28
  }
}
```

### 1.3 Update teacher status

- Method: PATCH
- Endpoint: /api/teachers/:teacherId/status
- Auth: No in the live route setup
- Request body:

```json
{
  "status": "APPROVED"
}
```

- Example request:

```bash
curl -X PATCH "http://localhost:5000/api/teachers/TCH_2001/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Teacher status updated successfully",
  "data": {
    "teacherId": "TCH_2001",
    "status": "APPROVED"
  }
}
```

### 1.4 Update teacher course assignment

- Method: PATCH
- Endpoint: /api/teachers/:teacherId/course
- Auth: No in live route setup
- Request body:

```json
{
  "courseCode": "MATH10",
  "courseName": "Algebra",
  "className": "Class 10"
}
```

- Example request:

```bash
curl -X PATCH "http://localhost:5000/api/teachers/TCH_2001/course" \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"MATH10","courseName":"Algebra","className":"Class 10"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Teacher course updated successfully",
  "data": {
    "teacherId": "TCH_2001",
    "courseCode": "MATH10",
    "courseName": "Algebra",
    "className": "Class 10"
  }
}
```

### 1.5 Get teacher profile

- Method: GET
- Endpoint: /api/teachers/profile
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/profile" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "teacherId": "TCH_2001",
    "name": "Dr. Smith",
    "email": "smith@example.com",
    "mobile": "9876543210",
    "qualification": "M.Sc Mathematics",
    "experienceYears": 6,
    "bio": "Math educator with 6 years of experience.",
    "profileImage": "https://example.com/uploads/teacher/teacher_1.jpg",
    "status": "APPROVED"
  }
}
```

### 1.6 Update teacher profile

- Method: PUT
- Endpoint: /api/teachers/profile
- Auth: Required
- Content-Type: multipart/form-data
- Fields:
  - profileImage (optional file)
  - idProofDocument (optional file)
  - qualificationCertificates[] (optional files)
  - experienceCertificates[] (optional files)

- Example request:

```bash
curl -X PUT "http://localhost:5000/api/teachers/profile" \
  -H "Authorization: Bearer <token>" \
  -F "profileImage=@/path/to/profile.jpg" \
  -F "idProofDocument=@/path/to/idproof.pdf"
```

- Example response:

```json
{
  "success": true,
  "message": "Teacher profile updated successfully",
  "data": {
    "teacherId": "TCH_2001",
    "name": "Dr. Smith",
    "profileImage": "https://example.com/uploads/teacher/teacher_1.jpg",
    "idProofDocument": "https://example.com/uploads/teacher/documents/idproof.pdf"
  }
}
```

### 1.7 Get teacher courses

- Method: GET
- Endpoint: /api/teachers/courses
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/courses" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "courseCode": "MATH10",
      "courseName": "Algebra",
      "className": "Class 10",
      "subject": "Mathematics",
      "status": "ACTIVE"
    },
    {
      "courseCode": "PHYS10",
      "courseName": "Physics Basics",
      "className": "Class 10",
      "subject": "Physics",
      "status": "ACTIVE"
    }
  ]
}
```

### 1.8 Get students for a teacher course

- Method: GET
- Endpoint: /api/teachers/courses/:courseCode/students
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/courses/MATH10/students" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "studentId": "STU_1001",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "status": "APPROVED",
      "progressPercentage": 72
    },
    {
      "studentId": "STU_1002",
      "name": "Aisha Khan",
      "email": "aisha@example.com",
      "mobile": "9876543211",
      "status": "APPROVED",
      "progressPercentage": 84
    }
  ]
}
```

### 1.9 Get teacher live sessions

- Method: GET
- Endpoint: /api/teachers/:teacherId/livesessions
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/TCH_2001/livesessions" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 9,
      "title": "Algebra Live",
      "startTime": "2025-02-20T18:00:00.000Z",
      "meetingLink": "https://meet.example.com/algebra",
      "status": "SCHEDULED"
    }
  ]
}
```

### 1.10 Get teacher course count

- Method: GET
- Endpoint: /api/teachers/:teacherId/coursecount
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/TCH_2001/coursecount" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "teacherId": "TCH_2001",
    "courseCount": 3
  }
}
```

### 1.11 Get total student count for teacher

- Method: GET
- Endpoint: /api/teachers/total-students
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/total-students" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "teacherId": "TCH_2001",
    "totalStudents": 128
  }
}
```

### 1.12 Delete teacher account

- Method: DELETE
- Endpoint: /api/teachers/delete-account/:teacherId
- Auth: No in current runtime implementation
- Example request:

```bash
curl -X DELETE "http://localhost:5000/api/teachers/delete-account/TCH_2001"
```

- Example response:

```json
{
  "success": true,
  "message": "Teacher account deleted successfully",
  "data": {
    "teacherId": "TCH_2001",
    "status": "TERMINATED"
  }
}
```

---

## 2) Teacher test module

### 2.1 Create teacher test

- Method: POST
- Endpoint: /api/teachers/tests
- Auth: Required
- Request body:

```json
{
  "courseCode": "MATH10",
  "title": "Unit Test 1",
  "description": "Algebra basics",
  "totalMarks": 50,
  "deadline": "2025-02-20T18:00:00.000Z"
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/tests" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"MATH10","title":"Unit Test 1","description":"Algebra basics","totalMarks":50,"deadline":"2025-02-20T18:00:00.000Z"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Test created successfully",
  "data": {
    "id": 11,
    "courseCode": "MATH10",
    "title": "Unit Test 1",
    "description": "Algebra basics",
    "totalMarks": 50,
    "deadline": "2025-02-20T18:00:00.000Z",
    "status": "ACTIVE"
  }
}
```

### 2.2 Get teacher tests

- Method: GET
- Endpoint: /api/teachers/tests
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/tests" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 11,
      "courseCode": "MATH10",
      "title": "Unit Test 1",
      "totalMarks": 50,
      "status": "ACTIVE"
    },
    {
      "id": 12,
      "courseCode": "PHYS10",
      "title": "Motion Quiz",
      "totalMarks": 25,
      "status": "ACTIVE"
    }
  ]
}
```

### 2.3 Get teacher test by ID

- Method: GET
- Endpoint: /api/teachers/tests/:id
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/tests/11" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "id": 11,
    "courseCode": "MATH10",
    "title": "Unit Test 1",
    "description": "Algebra basics",
    "totalMarks": 50,
    "deadline": "2025-02-20T18:00:00.000Z",
    "questions": [
      {
        "id": 1,
        "questionText": "Factor x^2 - 9",
        "options": ["x-3", "x+3", "(x-3)(x+3)", "9x"],
        "correctOption": "C"
      }
    ]
  }
}
```

### 2.4 Get tests by course code

- Method: GET
- Endpoint: /api/teachers/tests/course/:courseCode
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/tests/course/MATH10" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 11,
      "title": "Unit Test 1",
      "totalMarks": 50,
      "deadline": "2025-02-20T18:00:00.000Z"
    }
  ]
}
```

### 2.5 Update teacher test

- Method: PUT
- Endpoint: /api/teachers/tests/:id
- Auth: Required
- Request body:

```json
{
  "title": "Unit Test 1 - Updated",
  "totalMarks": 60
}
```

- Example request:

```bash
curl -X PUT "http://localhost:5000/api/teachers/tests/11" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Unit Test 1 - Updated","totalMarks":60}'
```

- Example response:

```json
{
  "success": true,
  "message": "Test updated successfully",
  "data": {
    "id": 11,
    "title": "Unit Test 1 - Updated",
    "totalMarks": 60
  }
}
```

### 2.6 Delete teacher test

- Method: DELETE
- Endpoint: /api/teachers/tests/:id
- Auth: Required
- Example request:

```bash
curl -X DELETE "http://localhost:5000/api/teachers/tests/11" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "message": "Test deleted successfully",
  "data": {
    "id": 11
  }
}
```

### 2.7 Get test submissions for teacher

- Method: GET
- Endpoint: /api/teachers/tests/:teacherId/test-submissions
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/tests/TCH_2001/test-submissions" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "submissionId": 90,
      "studentId": "STU_1001",
      "studentName": "John Doe",
      "testId": 11,
      "marks": 42,
      "status": "SUBMITTED"
    }
  ]
}
```

### 2.8 Grade a test submission

- Method: PUT
- Endpoint: /api/teachers/tests/grade-submission/:submissionId
- Auth: Required
- Request body:

```json
{
  "marks": 42,
  "remarks": "Good work. Review algebra identities."
}
```

- Example request:

```bash
curl -X PUT "http://localhost:5000/api/teachers/tests/grade-submission/90" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"marks":42,"remarks":"Good work. Review algebra identities."}'
```

- Example response:

```json
{
  "success": true,
  "message": "Submission graded successfully",
  "data": {
    "submissionId": 90,
    "marks": 42,
    "remarks": "Good work. Review algebra identities.",
    "gradedAt": "2025-02-10T12:00:00.000Z"
  }
}
```

---

## 3) Teacher notes module

### 3.1 Stream note/video

- Method: GET
- Endpoint: /api/teachers/notes/stream
- Auth: Required in the internal route, but response is usually a media stream
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/notes/stream" \
  -H "Authorization: Bearer <token>"
```

- Example response:
- Usually a binary stream or video payload, not JSON.

### 3.2 Create note

- Method: POST
- Endpoint: /api/teachers/notes
- Auth: Required
- Content-Type: multipart/form-data
- Field: file

- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/notes" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/notes.pdf"
```

- Example response:

```json
{
  "success": true,
  "message": "Note uploaded successfully",
  "data": {
    "id": 5,
    "filename": "notes.pdf",
    "url": "https://example.com/uploads/notes.pdf",
    "uploadedBy": "TCH_2001"
  }
}
```

### 3.3 Get teacher notes

- Method: GET
- Endpoint: /api/teachers/notes
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/notes" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "filename": "notes.pdf",
      "url": "https://example.com/uploads/notes.pdf",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3.4 Update note

- Method: PUT
- Endpoint: /api/teachers/notes/:id
- Auth: Required
- Request body:

```json
{
  "title": "Algebra Formula Sheet",
  "description": "Updated revision sheet for Class 10"
}
```

- Example request:

```bash
curl -X PUT "http://localhost:5000/api/teachers/notes/5" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Algebra Formula Sheet","description":"Updated revision sheet for Class 10"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "id": 5,
    "title": "Algebra Formula Sheet",
    "description": "Updated revision sheet for Class 10"
  }
}
```

### 3.5 Delete note

- Method: DELETE
- Endpoint: /api/teachers/notes/:id
- Auth: Required
- Example request:

```bash
curl -X DELETE "http://localhost:5000/api/teachers/notes/5" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "message": "Note deleted successfully",
  "data": {
    "id": 5
  }
}
```

### 3.6 Get note count

- Method: GET
- Endpoint: /api/teachers/notes/count
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/notes/count" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "count": 18
  }
}
```

---

## 4) Teacher subscription module

### 4.1 Create cashfree order

- Method: POST
- Endpoint: /api/teachers/subscriptions/create-cashfree-order
- Auth: Required
- Request body:

```json
{
  "teacherId": "TCH_2001",
  "subscriptionId": 3,
  "amount": 4999
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/subscriptions/create-cashfree-order" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"teacherId":"TCH_2001","subscriptionId":3,"amount":4999}'
```

- Example response:

```json
{
  "success": true,
  "message": "Cashfree order created successfully",
  "data": {
    "orderId": "ORD_12345",
    "amount": 4999,
    "currency": "INR",
    "paymentLink": "https://example.com/payment/ord_12345"
  }
}
```

### 4.2 Verify cashfree order

- Method: POST
- Endpoint: /api/teachers/subscriptions/verify-cashfree-order/:orderId
- Auth: Required
- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/subscriptions/verify-cashfree-order/ORD_12345" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "ORD_12345",
    "status": "PAID"
  }
}
```

### 4.3 Get teacher subscription status

- Method: GET
- Endpoint: /api/teachers/subscriptions/teacher/:teacherId/subscription-status
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/subscriptions/teacher/TCH_2001/subscription-status" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "teacherId": "TCH_2001",
    "planName": "Premium Teacher",
    "status": "ACTIVE",
    "expiresAt": "2025-03-15T00:00:00.000Z"
  }
}
```

---

## 5) Teacher assignment module

### 5.1 Create assignment

- Method: POST
- Endpoint: /api/teachers/assignments/:teacherId
- Auth: Required
- Content-Type: multipart/form-data
- Fields:
  - teacherId in path
  - title
  - description
  - courseCode
  - file

- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/assignments/TCH_2001" \
  -H "Authorization: Bearer <token>" \
  -F "title=Assignment 1" \
  -F "description=Solve 10 algebra questions" \
  -F "courseCode=MATH10" \
  -F "file=@/path/to/assignment.pdf"
```

- Example response:

```json
{
  "success": true,
  "message": "Assignment created successfully",
  "data": {
    "id": 42,
    "teacherId": "TCH_2001",
    "courseCode": "MATH10",
    "title": "Assignment 1",
    "fileUrl": "https://example.com/uploads/assignments/assignment_42.pdf"
  }
}
```

### 5.2 Get assignments

- Method: GET
- Endpoint: /api/teachers/assignments
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/assignments" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "teacherId": "TCH_2001",
      "title": "Assignment 1",
      "courseCode": "MATH10",
      "createdAt": "2025-01-18T11:00:00.000Z"
    }
  ]
}
```

### 5.3 Get assignment by ID

- Method: GET
- Endpoint: /api/teachers/assignments/:id
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/assignments/42" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "id": 42,
    "teacherId": "TCH_2001",
    "title": "Assignment 1",
    "description": "Solve 10 algebra questions",
    "courseCode": "MATH10",
    "fileUrl": "https://example.com/uploads/assignments/assignment_42.pdf"
  }
}
```

### 5.4 Submit assignment by student

- Method: POST
- Endpoint: /api/teachers/assignments/students/submission
- Auth: Required
- Content-Type: multipart/form-data
- Fields:
  - studentId
  - assignmentId
  - file

- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/assignments/students/submission" \
  -H "Authorization: Bearer <token>" \
  -F "studentId=STU_1001" \
  -F "assignmentId=42" \
  -F "file=@/path/to/submission.pdf"
```

- Example response:

```json
{
  "success": true,
  "message": "Assignment submitted successfully",
  "data": {
    "id": 88,
    "studentId": "STU_1001",
    "assignmentId": 42,
    "status": "SUBMITTED",
    "submittedAt": "2025-01-20T10:20:00.000Z"
  }
}
```

### 5.5 Check assignment by teacher

- Method: PUT
- Endpoint: /api/teachers/assignments/teacher/submission/:submissionId
- Auth: Required
- Request body:

```json
{
  "marks": 95,
  "feedback": "Excellent work"
}
```

- Example request:

```bash
curl -X PUT "http://localhost:5000/api/teachers/assignments/teacher/submission/88" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"marks":95,"feedback":"Excellent work"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Assignment evaluated successfully",
  "data": {
    "submissionId": 88,
    "marks": 95,
    "feedback": "Excellent work"
  }
}
```

---

## 6) Teacher live session module

### 6.1 Create live session

- Method: POST
- Endpoint: /api/teachers/livesessions
- Auth: Required
- Content-Type: multipart/form-data
- Fields:
  - title
  - startTime
  - meetingLink
  - thumbnail (file)

- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/livesessions" \
  -H "Authorization: Bearer <token>" \
  -F "title=Algebra Live" \
  -F "startTime=2025-02-20T18:00:00.000Z" \
  -F "meetingLink=https://meet.example.com/algebra" \
  -F "thumbnail=@/path/to/thumb.jpg"
```

- Example response:

```json
{
  "success": true,
  "message": "Live session created successfully",
  "data": {
    "id": 9,
    "title": "Algebra Live",
    "startTime": "2025-02-20T18:00:00.000Z",
    "meetingLink": "https://meet.example.com/algebra",
    "status": "SCHEDULED",
    "thumbnail": "https://example.com/uploads/live/thumb.jpg"
  }
}
```

### 6.2 Start live session

- Method: POST
- Endpoint: /api/teachers/livesessions/start
- Auth: Required
- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/livesessions/start" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":9}'
```

- Example response:

```json
{
  "success": true,
  "message": "Live session started",
  "data": {
    "sessionId": 9,
    "status": "LIVE"
  }
}
```

### 6.3 Join live session

- Method: POST
- Endpoint: /api/teachers/livesessions/join
- Auth: Required
- Example request:

```bash
curl -X POST "http://localhost:5000/api/teachers/livesessions/join" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":9,"studentId":"STU_1001"}'
```

- Example response:

```json
{
  "success": true,
  "data": {
    "sessionId": 9,
    "studentId": "STU_1001",
    "joinedAt": "2025-02-20T18:05:00.000Z",
    "status": "JOINED"
  }
}
```

### 6.4 Delete live session

- Method: DELETE
- Endpoint: /api/teachers/livesessions/:sessionId
- Auth: Required
- Example request:

```bash
curl -X DELETE "http://localhost:5000/api/teachers/livesessions/9" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "message": "Live session deleted successfully",
  "data": {
    "sessionId": 9
  }
}
```

---

## 7) Teacher notifications module

### 7.1 Get teacher notifications

- Method: GET
- Endpoint: /api/teachers/notifications/notifications
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/teachers/notifications/notifications" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "New student enrolled",
      "message": "John Doe enrolled in Algebra",
      "type": "INFO",
      "createdAt": "2025-01-15T12:10:00.000Z"
    }
  ]
}
```

### 7.2 Delete all teacher notifications

- Method: DELETE
- Endpoint: /api/teachers/notifications/notifications/all
- Auth: Required
- Example request:

```bash
curl -X DELETE "http://localhost:5000/api/teachers/notifications/notifications/all" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "message": "Teacher notifications cleared successfully"
}
```

---

## 8) Teacher module summary

The teacher backend is organized into these internal modules:

- backend/teacher/courses
- backend/teacher/tests
- backend/teacher/notes
- backend/teacher/subscription
- backend/teacher/assignments
- backend/teacher/livesessions
- backend/teacher/notifications

The public route contract remains the existing live teacher endpoints. The internal folder split is only for maintainability and should not change the URL structure used by the app or mobile clients.
