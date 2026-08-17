# Android API Reference

This document provides API endpoints specifically designed for the Android mobile application, consolidated from three separate route modules (home, coursePageData, teacherStudentData).

## Conventions

- Base URL: http://localhost:5000
- Auth header: Authorization: Bearer <token> (where required)
- JSON requests: Content-Type: application/json
- Success response pattern:

```json
{
  "success": true,
  "data": {}
}
```

- Error response pattern:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 1) Home Data (`/api/android/home/:studentId`)

Provides aggregated dashboard data for the Android app home screen.

### 1.1 Get home dashboard data

- Method: GET
- Endpoint: /api/android/home/:studentId
- Auth: No (student ID in path)
- Example request:

```bash
curl -X GET "http://localhost:5000/api/android/home/STU_1001"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "student": {
      "studentId": "STU_1001",
      "name": "Raj Kumar",
      "email": "raj@example.com",
      "class": "10th",
      "profileImage": "https://cloudinary.com/...",
      "status": "ACTIVE"
    },
    "enrolledCourses": [
      {
        "courseCode": "MATH_10_001",
        "courseName": "Mathematics - Grade 10",
        "teacher": "Dr. Smith",
        "progress": 65,
        "lastAccessed": "2024-12-15T10:30:00.000Z"
      }
    ],
    "upcomingTests": [
      {
        "testId": "TEST_001",
        "testName": "Chapter 1 Quiz",
        "courseCode": "MATH_10_001",
        "scheduledFor": "2024-12-20T10:00:00.000Z",
        "duration": 60
      }
    ],
    "notifications": [
      {
        "notificationId": "NOTIF_001",
        "title": "New assignment posted",
        "message": "Dr. Smith posted a new assignment",
        "type": "assignment",
        "createdAt": "2024-12-15T11:00:00.000Z",
        "read": false
      }
    ],
    "banners": [
      {
        "bannerId": "BAN_001",
        "title": "Winter Special Offer",
        "imageUrl": "https://cloudinary.com/...",
        "link": "/courses/winter-2025"
      }
    ]
  }
}
```

---

## 2) Course Page Data (`/api/android/coursepagedata/:studentId`)

Provides course catalog and enrollment data for the courses page.

### 2.1 Get all courses for student

- Method: GET
- Endpoint: /api/android/coursepagedata/:studentId
- Auth: No (student ID in path)
- Example request:

```bash
curl -X GET "http://localhost:5000/api/android/coursepagedata/STU_1001"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "availableCourses": [
      {
        "courseCode": "MATH_10_001",
        "courseName": "Mathematics - Grade 10",
        "description": "Comprehensive mathematics course",
        "class": "10th",
        "subject": "Mathematics",
        "teacher": {
          "teacherId": "TCH_2001",
          "name": "Dr. Smith",
          "qualification": "M.Sc Mathematics"
        },
        "price": 999,
        "rating": 4.5,
        "studentsEnrolled": 45,
        "thumbnail": "https://cloudinary.com/...",
        "isEnrolled": false,
        "duration": "3 months"
      }
    ],
    "enrolledCourses": [
      {
        "courseCode": "PHYS_10_001",
        "courseName": "Physics - Grade 10",
        "teacher": "Dr. Johnson",
        "progress": 75,
        "lastAccessed": "2024-12-15T10:30:00.000Z",
        "isEnrolled": true
      }
    ],
    "filters": {
      "classes": ["8th", "9th", "10th", "11th", "12th"],
      "subjects": ["Mathematics", "Physics", "Chemistry", "Biology"]
    }
  }
}
```

### 2.2 Get courses by subject

- Method: GET
- Endpoint: /api/android/coursepagedata/:studentId/subject/:subjectCode
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/android/coursepagedata/STU_1001/subject/MATH"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "courseCode": "MATH_10_001",
      "courseName": "Mathematics - Grade 10",
      "class": "10th",
      "teacher": "Dr. Smith",
      "price": 999,
      "rating": 4.5,
      "thumbnail": "https://cloudinary.com/...",
      "isEnrolled": false
    }
  ]
}
```

### 2.3 Get course content by student

- Method: GET
- Endpoint: /api/android/coursepagedata/:studentId/:courseCode/content
- Auth: Required
- Query parameters:
  - `limit`: Number of content items (default: 20)
  - `offset`: Pagination offset (default: 0)

- Example request:

```bash
curl -X GET "http://localhost:5000/api/android/coursepagedata/STU_1001/MATH_10_001/content" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "contentId": "CONT_001",
      "title": "Chapter 1: Introduction to Algebra",
      "type": "video",
      "videoUrl": "https://youtube.com/...",
      "duration": 2400,
      "isWatched": true,
      "watchedPercentage": 100,
      "order": 1,
      "uploadedAt": "2024-12-01T10:30:00.000Z"
    },
    {
      "contentId": "CONT_002",
      "title": "Chapter 1: Practice Problems",
      "type": "document",
      "documentUrl": "https://cloudinary.com/...",
      "downloadCount": 5,
      "order": 2,
      "uploadedAt": "2024-12-01T11:30:00.000Z"
    }
  ]
}
```

---

## 3) Teacher Student Data (`/api/android/teacherstudentdata/:teacherId`)

Provides teacher-specific data for teacher mobile app access (view student progress, assignments, etc.).

### 3.1 Get all students for teacher

- Method: GET
- Endpoint: /api/android/teacherstudentdata/:teacherId
- Auth: No (teacher ID in path)
- Example request:

```bash
curl -X GET "http://localhost:5000/api/android/teacherstudentdata/TCH_2001"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "teacher": {
      "teacherId": "TCH_2001",
      "name": "Dr. Smith",
      "email": "smith@example.com",
      "qualification": "M.Sc Mathematics",
      "profileImage": "https://cloudinary.com/...",
      "totalCourses": 5
    },
    "courses": [
      {
        "courseCode": "MATH_10_001",
        "courseName": "Mathematics - Grade 10",
        "studentCount": 45,
        "totalClasses": 20,
        "completedClasses": 18,
        "averageProgress": 72
      }
    ],
    "students": [
      {
        "studentId": "STU_1001",
        "name": "Raj Kumar",
        "email": "raj@example.com",
        "class": "10th",
        "enrolledCourses": [
          {
            "courseCode": "MATH_10_001",
            "progress": 85,
            "testsAttempted": 3,
            "averageScore": 78
          }
        ],
        "profileImage": "https://cloudinary.com/..."
      }
    ],
    "assignments": [
      {
        "assignmentId": "ASSIGN_001",
        "title": "Algebra Problems - Chapter 1",
        "courseCode": "MATH_10_001",
        "totalSubmissions": 40,
        "pendingReview": 5,
        "dueDate": "2024-12-20T23:59:59.000Z"
      }
    ],
    "pendingTasks": {
      "assignmentsToReview": 5,
      "messagesUnread": 2,
      "reportsToFile": 1
    }
  }
}
```

---

## 4) Enrollment Operations

### 4.1 Enroll student in course

- Method: POST
- Endpoint: /api/android/enroll
- Auth: Required
- Request body:

```json
{
  "studentId": "STU_1001",
  "courseCode": "MATH_10_001",
  "paymentMethod": "upi"
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/android/enroll" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU_1001",
    "courseCode": "MATH_10_001",
    "paymentMethod": "upi"
  }'
```

- Example response:

```json
{
  "success": true,
  "data": {
    "enrollmentId": "ENROLL_001",
    "courseCode": "MATH_10_001",
    "courseName": "Mathematics - Grade 10",
    "status": "ACTIVE",
    "enrolledAt": "2024-12-15T10:30:00.000Z",
    "accessUntil": "2025-03-15T23:59:59.000Z"
  }
}
```

---

## 5) Test Operations (Android)

### 5.1 Get tests for student

- Method: GET
- Endpoint: /api/android/tests/:studentId
- Auth: Required
- Example request:

```bash
curl -X GET "http://localhost:5000/api/android/tests/STU_1001" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "testId": "TEST_001",
      "testName": "Chapter 1 Quiz",
      "courseCode": "MATH_10_001",
      "courseName": "Mathematics - Grade 10",
      "totalQuestions": 20,
      "duration": 60,
      "totalMarks": 20,
      "scheduledFor": "2024-12-20T10:00:00.000Z",
      "status": "scheduled",
      "isAttempted": false,
      "bestScore": null
    }
  ]
}
```

### 5.2 Start test attempt

- Method: POST
- Endpoint: /api/android/tests/:testId/start
- Auth: Required
- Request body:

```json
{
  "studentId": "STU_1001"
}
```

---

## Summary of Android Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/android/home/:studentId | Get home dashboard |
| GET | /api/android/coursepagedata/:studentId | Get courses list |
| GET | /api/android/coursepagedata/:studentId/subject/:subject | Filter by subject |
| GET | /api/android/coursepagedata/:studentId/:code/content | Get course content |
| GET | /api/android/teacherstudentdata/:teacherId | Get teacher data |
| POST | /api/android/enroll | Enroll in course |
| GET | /api/android/tests/:studentId | Get student tests |
| POST | /api/android/tests/:testId/start | Start test |

---

## Performance Recommendations

1. **Caching**: Cache home and course page data with 5-minute TTL
2. **Pagination**: Use limit/offset for large datasets (content, assignments)
3. **Network**: Compress JSON responses for mobile bandwidth optimization
4. **Images**: Use Cloudinary CDN with responsive sizing (width=200 for thumbnails)

---

**Last Updated**: December 2024
**API Version**: 1.0.0
**Maintained By**: Development Team
**Platform**: Android Mobile Application
