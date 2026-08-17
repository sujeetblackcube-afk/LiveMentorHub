# Shared API Reference

This document provides API endpoints for shared resources accessible across multiple frontends: banners, courses, content, syllabus, questions, and contact forms.

## Conventions

- Base URL: http://localhost:5000
- Auth header: Authorization: Bearer <token> (where required)
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

---

## 1) Banners Management (`/api/banners`)

Banners are promotional content displayed on the homepage/dashboard across all frontends.

### 1.1 Create banner

- Method: POST
- Endpoint: /api/banners
- Auth: Required (SuperAdmin)
- Request body (multipart/form-data):

```json
{
  "title": "Summer Courses Now Available",
  "description": "Enroll in our premium summer courses",
  "link": "/courses/summer-2025",
  "order": 1,
  "isActive": true
}
```

- File field: `image` (JPG, PNG, max 5MB)
- Example request:

```bash
curl -X POST "http://localhost:5000/api/banners" \
  -H "Authorization: Bearer <token>" \
  -F "title=Summer Courses Now Available" \
  -F "description=Enroll in our premium summer courses" \
  -F "link=/courses/summer-2025" \
  -F "order=1" \
  -F "isActive=true" \
  -F "image=@banner.jpg"
```

### 1.2 Get all banners

- Method: GET
- Endpoint: /api/banners
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/banners"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "bannerId": "BAN_001",
      "title": "Summer Courses Now Available",
      "description": "Enroll in our premium summer courses",
      "imageUrl": "https://cloudinary.com/...",
      "link": "/courses/summer-2025",
      "order": 1,
      "isActive": true,
      "createdAt": "2024-12-01T10:30:00.000Z"
    }
  ]
}
```

### 1.3 Update banner

- Method: PUT
- Endpoint: /api/banners/:bannerId
- Auth: Required (SuperAdmin)
- Request body:

```json
{
  "title": "Updated Banner Title",
  "isActive": false
}
```

### 1.4 Delete banner

- Method: DELETE
- Endpoint: /api/banners/:bannerId
- Auth: Required (SuperAdmin)
- Example request:

```bash
curl -X DELETE "http://localhost:5000/api/banners/BAN_001" \
  -H "Authorization: Bearer <token>"
```

---

## 2) Courses Catalog (`/api/courses`)

Public course listings accessible to all users.

### 2.1 Get all courses

- Method: GET
- Endpoint: /api/courses
- Auth: No
- Query parameters:
  - `class`: Filter by class (e.g., "10th", "12th")
  - `subject`: Filter by subject
  - `limit`: Number of results (default: 20)
  - `offset`: Pagination offset (default: 0)

- Example request:

```bash
curl -X GET "http://localhost:5000/api/courses?class=10th&limit=10"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "courseCode": "MATH_10_001",
      "courseName": "Mathematics - Grade 10",
      "description": "Comprehensive mathematics course for grade 10",
      "class": "10th",
      "subject": "Mathematics",
      "teacher": {
        "teacherId": "TCH_2001",
        "name": "Dr. Smith"
      },
      "price": 999,
      "duration": "3 months",
      "studentsEnrolled": 45,
      "rating": 4.5,
      "thumbnail": "https://cloudinary.com/...",
      "createdAt": "2024-12-01T10:30:00.000Z"
    }
  ]
}
```

### 2.2 Get course by code

- Method: GET
- Endpoint: /api/courses/:courseCode
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/courses/MATH_10_001"
```

### 2.3 Create course (Teacher)

- Method: POST
- Endpoint: /api/courses
- Auth: Required (Teacher)
- Request body:

```json
{
  "courseName": "Physics - Grade 12",
  "description": "Advanced physics for grade 12",
  "class": "12th",
  "subject": "Physics",
  "price": 1299,
  "duration": "4 months",
  "syllabus": "PHYS_12_001"
}
```

---

## 3) Course Content (`/api/content`)

Videos, documents, and learning materials within courses.

### 3.1 Get content by course

- Method: GET
- Endpoint: /api/content/course/:courseCode
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/content/course/MATH_10_001"
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
      "order": 1,
      "createdAt": "2024-12-01T10:30:00.000Z"
    },
    {
      "contentId": "CONT_002",
      "title": "Chapter 1: Practice Problems",
      "type": "document",
      "documentUrl": "https://cloudinary.com/...",
      "order": 2,
      "createdAt": "2024-12-01T11:30:00.000Z"
    }
  ]
}
```

### 3.2 Upload new content

- Method: POST
- Endpoint: /api/content
- Auth: Required (Teacher)
- Request body (multipart/form-data):

```json
{
  "title": "Chapter 1: Introduction",
  "type": "video",
  "courseCode": "MATH_10_001",
  "order": 1
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/content" \
  -H "Authorization: Bearer <token>" \
  -F "title=Chapter 1: Introduction" \
  -F "type=video" \
  -F "courseCode=MATH_10_001" \
  -F "order=1" \
  -F "file=@video.mp4"
```

---

## 4) Syllabus (`/api/syllabus`)

Curriculum structure and topics for each course.

### 4.1 Get syllabus by course

- Method: GET
- Endpoint: /api/syllabus/:courseCode
- Auth: No
- Example request:

```bash
curl -X GET "http://localhost:5000/api/syllabus/MATH_10_001"
```

- Example response:

```json
{
  "success": true,
  "data": {
    "syllabusId": "SYLL_001",
    "courseCode": "MATH_10_001",
    "courseName": "Mathematics - Grade 10",
    "chapters": [
      {
        "chapterNumber": 1,
        "title": "Real Numbers",
        "topics": ["Introduction", "Types of numbers", "Rational numbers"],
        "duration": 300
      },
      {
        "chapterNumber": 2,
        "title": "Polynomials",
        "topics": ["Definition", "Zeros", "Division algorithm"],
        "duration": 360
      }
    ]
  }
}
```

### 4.2 Create syllabus (Teacher/Admin)

- Method: POST
- Endpoint: /api/syllabus
- Auth: Required (Teacher/SuperAdmin)
- Request body:

```json
{
  "courseCode": "MATH_10_001",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Real Numbers",
      "topics": ["Introduction", "Types of numbers"],
      "duration": 300
    }
  ]
}
```

---

## 5) Test Questions (`/api/questions`)

Questions used in tests and quizzes.

### 5.1 Get questions by test

- Method: GET
- Endpoint: /api/questions/test/:testId
- Auth: Required (for enrolled students)
- Example request:

```bash
curl -X GET "http://localhost:5000/api/questions/test/TEST_001" \
  -H "Authorization: Bearer <token>"
```

- Example response:

```json
{
  "success": true,
  "data": [
    {
      "questionId": "QUE_001",
      "testId": "TEST_001",
      "questionText": "What is 2 + 2?",
      "type": "mcq",
      "options": [
        { "id": "A", "text": "3" },
        { "id": "B", "text": "4" },
        { "id": "C", "text": "5" }
      ],
      "correctAnswer": "B",
      "marks": 1,
      "order": 1
    }
  ]
}
```

### 5.2 Create question (Teacher)

- Method: POST
- Endpoint: /api/questions
- Auth: Required (Teacher)
- Request body:

```json
{
  "testId": "TEST_001",
  "questionText": "What is 2 + 2?",
  "type": "mcq",
  "options": [
    { "text": "3" },
    { "text": "4" },
    { "text": "5" }
  ],
  "correctAnswer": 1,
  "marks": 1,
  "order": 1
}
```

---

## 6) Contact Us (`/api/contactus`)

Contact form submissions from users.

### 6.1 Submit contact form

- Method: POST
- Endpoint: /api/contactus
- Auth: No
- Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Course Inquiry",
  "message": "I am interested in the Mathematics course.",
  "phone": "9876543210"
}
```

- Example request:

```bash
curl -X POST "http://localhost:5000/api/contactus" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Course Inquiry",
    "message": "I am interested in the Mathematics course.",
    "phone": "9876543210"
  }'
```

- Example response:

```json
{
  "success": true,
  "message": "Your message has been sent successfully",
  "data": {
    "contactId": "CONT_MSG_001",
    "createdAt": "2024-12-15T10:30:00.000Z"
  }
}
```

### 6.2 Get all contact submissions (Admin)

- Method: GET
- Endpoint: /api/contactus
- Auth: Required (SuperAdmin)
- Example request:

```bash
curl -X GET "http://localhost:5000/api/contactus" \
  -H "Authorization: Bearer <token>"
```

---

## Summary of Shared Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/banners | Create banner |
| GET | /api/banners | Get all banners |
| PUT | /api/banners/:id | Update banner |
| DELETE | /api/banners/:id | Delete banner |
| GET | /api/courses | List all courses |
| GET | /api/courses/:code | Get course details |
| POST | /api/courses | Create course |
| GET | /api/content/course/:code | Get course content |
| POST | /api/content | Upload content |
| GET | /api/syllabus/:code | Get course syllabus |
| POST | /api/syllabus | Create syllabus |
| GET | /api/questions/test/:id | Get test questions |
| POST | /api/questions | Create question |
| POST | /api/contactus | Submit contact form |
| GET | /api/contactus | Get all submissions |

---

**Last Updated**: December 2024
**API Version**: 1.0.0
**Maintained By**: Development Team
