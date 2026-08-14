## 1. Classes

### 1.1 Get All Classes (Aggregated Stats)
Retrieves all class records with a summary of subject, course, and enrollment counts from the real database schema.

**Endpoint:** `/api/superadmin/classes`  
**Method:** `GET`  
**Auth:** Admin Only  

**Response Body (200 OK):**
```json
[
  {
    "classId": 1,
    "className": "Grade 10",
    "status": "ACTIVE",
    "totalSubjects": 4,
    "totalCourses": 12,
    "totalEnrolledStudents": 450
  }
]
```

### 1.2 Get Class Subject & Course Breakdown
Retrieves a full class hierarchy using the actual `classes`, `subjects`, and `courses` tables.

**Endpoint:** `/api/superadmin/classes/{classId}/hierarchy`  
**Method:** `GET`  
**Auth:** Admin Only  

**Response Body (200 OK):**
```json
{
  "classId": 1,
  "className": "Grade 10",
  "status": "ACTIVE",
  "subjects": [
    {
      "subjectCode": "PHY01",
      "subjectName": "Physics",
      "description": "Motion and forces",
      "language": "English",
      "status": "ACTIVE",
      "courses": [
        {
          "courseCode": "COURSE-101",
          "courseName": "Intro to Mechanics",
          "courseDescription": "Force and motion basics",
          "difficulty": "Beginner",
          "status": "Active",
          "mrp": 100,
          "discountedprice": 80,
          "enrolledStudentCount": 120
        }
      ]
    }
  ]
}
```

---

## 2. Subjects

### 2.1 Get Courses by Subject
Retrieves all course records for a subject using the database field `subjectCode`.

**Endpoint:** `/api/superadmin/subjects/{subjectCode}/courses`  
**Method:** `GET`  
**Auth:** Admin Only  

**Response Body (200 OK):**
```json
[
  {
    "courseCode": "COURSE-101",
    "courseName": "Intro to Mechanics",
    "courseDescription": "Force and motion basics",
    "courseType": "academic",
    "difficulty": "Beginner",
    "mrp": 100,
    "discountedprice": 80,
    "status": "Active",
    "totalenrollment": 120,
    "classname": "Grade 10",
    "subject": "Physics",
    "subjectCode": "PHY01",
    "thumbnail": "https://.../image.jpg",
    "introVideo": "https://.../video.mp4",
    "totalReviews": 12,
    "rating": 4.8
  }
]
```

---

## 3. Courses

### 3.1 Update Course Details
Updates supported course properties while ignoring reserved fields such as `courseCode`, `id`, `rating`, and `totalReviews`.

**Endpoint:** `/api/superadmin/courses/{courseCode}`  
**Method:** `PATCH`  
**Auth:** Admin  

**Request Body:**
```json
{
  "courseName": "Updated Mechanics",
  "courseDescription": "Updated description for the course.",
  "mrp": 150,
  "discountedprice": 120,
  "status": "Inactive"
}
```

**Response Body (200 OK):**
```json
{
  "courseCode": "COURSE-101",
  "courseName": "Updated Mechanics",
  "courseDescription": "Updated description for the course.",
  "courseType": "academic",
  "difficulty": "Beginner",
  "mrp": "150.00",
  "discountedprice": "120.00",
  "status": "Inactive",
  "rating": 4.8,
  "totalReviews": 12
}
```

### 3.2 Get Course Participants
Retrieves the assigned teachers and enrolled students for a course using actual model fields like `Teacher.courseCode`, `Enrollment.studentId`, and `Enrollment.progress`.

**Endpoint:** `/api/superadmin/courses/{courseCode}/participants`  
**Method:** `GET`  
**Auth:** Admin  

**Response Body (200 OK):**
```json
{
  "teachers": [
    {
      "teacherId": "TCH-001",
      "name": "Dr. Jane",
      "email": "teacher@example.com",
      "mobile": "1234567890",
      "whatsappNumber": null,
      "status": "APPROVED"
    }
  ],
  "students": [
    {
      "studentId": "STU-001",
      "name": "Alice Student",
      "email": "alice@example.com",
      "progressPercentage": 40,
      "paymentStatus": "PAID",
      "status": "APPROVED"
    }
  ]
}
```
