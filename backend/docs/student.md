# Student API Reference

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

## 1) Student profile APIs

### 1.1 Get all students

- Method: GET
- Endpoint: /api/students
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/students"
```

- Example response:

```json
{
  "status": true,
  "message": "Students fetched successfully",
  "data": [
    {
      "studentId": "STU_1001",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "status": "APPROVED",
      "className": "Class 10"
    }
  ]
}
```

### 1.2 Get student count

- Method: GET
- Endpoint: /api/students/count
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/students/count"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "count": 240
  }
}
```

### 1.3 Get student by ID

- Method: GET
- Endpoint: /api/students/:studentId
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/students/STU_1001"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "studentId": "STU_1001",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "status": "APPROVED",
    "className": "Class 10",
    "createdAt": "2024-12-01T10:30:00.000Z"
  }
}
```

### 1.4 Get student progress

- Method: GET
- Endpoint: /api/students/:studentId/progress
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/students/STU_1001/progress"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "studentId": "STU_1001",
    "completedAssignments": 12,
    "completedTests": 4,
    "overallProgressPercent": 72,
    "courses": [
      {
        "courseCode": "MATH10",
        "courseName": "Algebra",
        "progressPercent": 78,
        "status": "ACTIVE"
      },
      {
        "courseCode": "PHYS10",
        "courseName": "Physics Basics",
        "progressPercent": 66,
        "status": "ACTIVE"
      }
    ]
  }
}
```

### 1.5 Update student status

- Method: PATCH
- Endpoint: /api/students/:studentId/status
- Auth: No in current live route setup
- Request body:

```json
{
  "status": "APPROVED"
}
```

- Example request:

```bash
curl -X PATCH "http://localhost:5000/api/students/STU_1001/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Student status updated successfully",
  "data": {
    "studentId": "STU_1001",
    "status": "APPROVED"
  }
}
```

### 1.6 Update student profile

- Method: PUT
- Endpoint: /api/students/:studentId
- Auth: No in current live route setup
- Content-Type: multipart/form-data
- Field: profileImage

- Example request:

```bash
curl -X PUT "http://localhost:5000/api/students/STU_1001" \
  -H "Authorization: Bearer <token>" \
  -F "profileImage=@/path/to/profile.jpg"
```

- Example response:

```json
{
  "success": true,
  "message": "Student profile updated successfully",
  "data": {
    "studentId": "STU_1001",
    "name": "John Doe",
    "profileImage": "https://example.com/uploads/students/STU_1001.jpg"
  }
}
```

### 1.7 Get student live sessions

- Method: GET
- Endpoint: /api/students/getlive-sessions/:studentId
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/students/getlive-sessions/STU_1001" \
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

### 1.8 Delete student account

- Method: DELETE
- Endpoint: /api/students/delete-account/:studentId
- Auth: No in current runtime implementation
- Example request:

```bash
curl -X DELETE "http://localhost:5000/api/students/delete-account/STU_1001"
```

- Example response:

```json
{
  "success": true,
  "message": "Student account deleted successfully",
  "data": {
    "studentId": "STU_1001",
    "status": "TERMINATED"
  }
}
```

---

## 2) Student enrollment module

### 2.1 Create cashfree order

- Method: POST
- Endpoint: /api/enrollments/create-cashfree-order
- Auth: Required
- Request body:

```json
{
  "studentId": "STU_1001",
  "courseCode": "MATH10",
  "amount": 4999
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/enrollments/create-cashfree-order" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU_1001","courseCode":"MATH10","amount":4999}'
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

### 2.2 Create enrollment

- Method: POST
- Endpoint: /api/enrollments
- Auth: Required
- Request body:

```json
{
  "studentId": "STU_1001",
  "courseCode": "MATH10",
  "teacherId": "TCH_2001"
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/enrollments" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU_1001","courseCode":"MATH10","teacherId":"TCH_2001"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Enrollment created successfully",
  "data": {
    "enrollmentCode": "ENR_5001",
    "studentId": "STU_1001",
    "courseCode": "MATH10",
    "teacherId": "TCH_2001",
    "status": "ACTIVE"
  }
}
```

### 2.3 Get all enrollments

- Method: GET
- Endpoint: /api/enrollments
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/enrollments" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "enrollmentCode": "ENR_5001",
      "studentId": "STU_1001",
      "courseCode": "MATH10",
      "teacherId": "TCH_2001",
      "status": "ACTIVE"
    }
  ]
}
```

### 2.4 Get enrollment count

- Method: GET
- Endpoint: /api/enrollments/count
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/enrollments/count" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "count": 452
  }
}
```

### 2.5 Get enrollments by student ID

- Method: GET
- Endpoint: /api/enrollments/student/:studentId
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/enrollments/student/STU_1001" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "enrollmentCode": "ENR_5001",
      "studentId": "STU_1001",
      "courseCode": "MATH10",
      "courseName": "Algebra",
      "status": "ACTIVE",
      "purchaseDate": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

### 2.6 Get enrollments by course code

- Method: GET
- Endpoint: /api/enrollments/course/:courseCode
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/enrollments/course/MATH10" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "enrollmentCode": "ENR_5001",
      "studentId": "STU_1001",
      "studentName": "John Doe",
      "status": "ACTIVE"
    }
  ]
}
```

### 2.7 Update enrollment

- Method: PUT
- Endpoint: /api/enrollments/:enrollmentCode
- Auth: Required
- Request body:

```json
{
  "status": "ACTIVE"
}
```

- Example request:

```bash
curl -X PUT "http://localhost:5000/api/enrollments/ENR_5001" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"ACTIVE"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Enrollment updated successfully",
  "data": {
    "enrollmentCode": "ENR_5001",
    "status": "ACTIVE"
  }
}
```

### 2.8 Delete enrollment

- Method: DELETE
- Endpoint: /api/enrollments/:enrollmentCode
- Auth: Required
- Example request:

```bash
curl -X DELETE "http://localhost:5000/api/enrollments/ENR_5001" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "message": "Enrollment deleted successfully",
  "data": {
    "enrollmentCode": "ENR_5001"
  }
}
```

---

## 3) Student tests module

### 3.1 Get tests for a student

- Method: GET
- Endpoint: /api/tests/:studentId
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/tests/STU_1001" \
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
      "courseName": "Algebra",
      "title": "Unit Test 1",
      "totalMarks": 50,
      "deadline": "2025-02-20T18:00:00.000Z"
    },
    {
      "id": 12,
      "courseCode": "PHYS10",
      "courseName": "Physics Basics",
      "title": "Motion Quiz",
      "totalMarks": 25,
      "deadline": "2025-02-25T18:00:00.000Z"
    }
  ]
}
```

### 3.2 Submit test

- Method: POST
- Endpoint: /api/tests/submit
- Auth: Required
- Request body:

```json
{
  "studentId": "STU_1001",
  "testId": 11,
  "answers": [
    { "questionId": 1, "selectedOption": "B" },
    { "questionId": 2, "selectedOption": "C" }
  ]
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/tests/submit" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU_1001","testId":11,"answers":[{"questionId":1,"selectedOption":"B"},{"questionId":2,"selectedOption":"C"}]}'
```

- Example response:

```json
{
  "success": true,
  "message": "Test submitted successfully",
  "data": {
    "submissionId": 90,
    "studentId": "STU_1001",
    "testId": 11,
    "score": 42,
    "status": "SUBMITTED"
  }
}
```

---

## 4) Student notes module

### 4.1 Stream note/video

- Method: GET
- Endpoint: /api/notes/stream
- Auth: Usually public, used by a video tag
- Example request:

```bash
curl -X GET "http://localhost:5000/api/notes/stream"
```

- Example response:
- This is usually a binary stream or video data, not JSON.

### 4.2 Get notes

- Method: GET
- Endpoint: /api/notes
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/notes" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "filename": "algebra-notes.pdf",
      "url": "https://example.com/uploads/algebra-notes.pdf",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 5) Student doubts module

### 5.1 Create doubt

- Method: POST
- Endpoint: /api/doubts
- Auth: No in current route setup
- Request body:

```json
{
  "studentId": "STU_1001",
  "teacherId": "TCH_2001",
  "courseCode": "MATH10",
  "question": "Why is x^2 - 9 = (x-3)(x+3)?"
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/doubts" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU_1001","teacherId":"TCH_2001","courseCode":"MATH10","question":"Why is x^2 - 9 = (x-3)(x+3)?"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Doubt submitted successfully",
  "data": {
    "id": 20,
    "studentId": "STU_1001",
    "teacherId": "TCH_2001",
    "courseCode": "MATH10",
    "question": "Why is x^2 - 9 = (x-3)(x+3)?",
    "status": "OPEN"
  }
}
```

### 5.2 Get doubts by student ID

- Method: GET
- Endpoint: /api/doubts/student/:studentId
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/doubts/student/STU_1001"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 20,
      "studentId": "STU_1001",
      "teacherId": "TCH_2001",
      "courseCode": "MATH10",
      "question": "Why is x^2 - 9 = (x-3)(x+3)?",
      "answer": "Because it is a difference of squares.",
      "status": "ANSWERED"
    }
  ]
}
```

### 5.3 Update doubt

- Method: PUT
- Endpoint: /api/doubts/:id
- Auth: No
- Request body:

```json
{
  "answer": "Because it is a difference of squares.",
  "status": "ANSWERED"
}
```

- Example request:

```bash
curl -X PUT "http://localhost:5000/api/doubts/20" \
  -H "Content-Type: application/json" \
  -d '{"answer":"Because it is a difference of squares.","status":"ANSWERED"}'
```

- Example response:

```json
{
  "success": true,
  "message": "Doubt updated successfully",
  "data": {
    "id": 20,
    "answer": "Because it is a difference of squares.",
    "status": "ANSWERED"
  }
}
```

---

## 6) Student review module

### 6.1 Submit review

- Method: POST
- Endpoint: /api/reviews
- Auth: Required
- Request body:

```json
{
  "studentId": "STU_1001",
  "courseCode": "MATH10",
  "rating": 5,
  "comment": "Great course and clear explanations."
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU_1001","courseCode":"MATH10","rating":5,"comment":"Great course and clear explanations."}'
```

- Example response:

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": 3,
    "studentId": "STU_1001",
    "courseCode": "MATH10",
    "rating": 5,
    "comment": "Great course and clear explanations."
  }
}
```

### 6.2 Get average rating

- Method: GET
- Endpoint: /api/reviews/average
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/reviews/average" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "averageRating": 4.8,
    "totalReviews": 120
  }
}
```

### 6.3 Check if student reviewed

- Method: GET
- Endpoint: /api/reviews/has-reviewed
- Auth: No in current route implementation
- Example request:

```bash
curl -X GET "http://localhost:5000/api/reviews/has-reviewed?studentId=STU_1001&courseCode=MATH10"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "hasReviewed": true
  }
}
```

---

## 7) Student module summary

The student backend is organized internally into:

- backend/student/profile
- backend/student/enrollments
- backend/student/tests
- backend/student/notes
- backend/student/doubts
- backend/student/reviews

The public route contract remains the existing live endpoints. The internal folder split is only for maintainability and should not change the URL structure used by the app, Android clients, or web frontend.
