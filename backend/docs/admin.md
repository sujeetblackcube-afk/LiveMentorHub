# Admin API Reference

This document reflects the current admin module structure under the backend/admin folder and the live public route contract that remains in production.

## Important routing rule

- The internal admin refactor lives under backend/admin.
- The runtime app still uses the principal live routes that were already working.
- The public production contract remains authoritative; the refactor is internal and should not change exposed URLs.
- No route should be created on /api/admin unless it is explicitly added to the app mount layer later.

## Current live/public admin-related routes

### Superadmin route group

```text
/api/superadmin
```

These are the production-safe admin endpoints currently in use:

- GET /api/superadmin/classes
- GET /api/superadmin/classes/:id/hierarchy
- GET /api/superadmin/subjects/:subjectCode/courses
- GET /api/superadmin/courses/:courseCode/participants
- PATCH /api/superadmin/courses/:courseCode

### Refactored internal admin modules

```text
backend/admin
```

The modular admin implementation includes the following route groups:

- /students
- /teachers
- /subscriptions
- /reports
- /notifications
- class and course logic under superadmin conventions

All requests require a valid JWT in the Authorization header unless the original legacy code explicitly did not require auth.

---

## 1) Student admin APIs

Base path: /api/admin/students

### 1.1 Get student count

- Method: GET
- Endpoint: /api/admin/students/count
- Auth: required
- Response: total student count, optionally filtered by status

### 1.2 Get all students

- Method: GET
- Endpoint: /api/admin/students
- Auth: required
- Query params: page, limit, search, status, startDate, endDate
- Response: paginated student list

### 1.3 Get student by ID

- Method: GET
- Endpoint: /api/admin/students/:studentId
- Auth: required
- Response: full student record

### 1.4 Update student status

- Method: PATCH
- Endpoint: /api/admin/students/:studentId/status
- Auth: required
- Request body: status payload
- Example status values: APPROVED, SUSPENDED, TERMINATED
- Response: updated student record

### 1.5 Delete student

- Method: DELETE
- Endpoint: /api/admin/students/:studentId
- Auth: required
- Behavior: soft delete / mark as terminated
- Response: deletion confirmation result

---

## 2) Teacher admin APIs

Base path: /api/admin/teachers

### 2.1 Get teacher count

- Method: GET
- Endpoint: /api/admin/teachers/count
- Auth: required
- Response: total teacher count

### 2.2 Get all teachers

- Method: GET
- Endpoint: /api/admin/teachers
- Auth: required
- Query params: page, limit, search, status, startDate, endDate
- Response: paginated teacher list

### 2.3 Update teacher status

- Method: PATCH
- Endpoint: /api/admin/teachers/:teacherId/status
- Auth: required
- Request body: status payload
- Example status values: PENDING, APPROVED, SUSPENDED, TERMINATED
- Response: updated teacher record

### 2.4 Update teacher courses

- Method: PATCH
- Endpoint: /api/admin/teachers/:teacherId/courses
- Auth: required
- Request body: course allocation payload
- Response: updated teacher course mapping

### 2.5 Delete teacher

- Method: DELETE
- Endpoint: /api/admin/teachers/:teacherId
- Auth: required
- Behavior: soft delete / mark as terminated
- Response: deletion confirmation result

---

## 3) Admin subscription APIs

Base path: /api/admin/subscriptions

### 3.1 Create subscription

- Method: POST
- Endpoint: /api/admin/subscriptions
- Auth: required
- Request body: subscription payload
- Response: created subscription record

### 3.2 Get all subscriptions

- Method: GET
- Endpoint: /api/admin/subscriptions
- Auth: required
- Response: subscription list

### 3.3 Get subscription by ID

- Method: GET
- Endpoint: /api/admin/subscriptions/:id
- Auth: required
- Response: subscription record

### 3.4 Update subscription

- Method: PUT
- Endpoint: /api/admin/subscriptions/:id
- Auth: required
- Request body: subscription updates
- Response: updated subscription

### 3.5 Delete subscription

- Method: DELETE
- Endpoint: /api/admin/subscriptions/:id
- Auth: required
- Response: deletion result

### 3.6 Get all bought subscriptions

- Method: GET
- Endpoint: /api/admin/subscriptions/buyed/all
- Auth: required
- Response: all subscription purchase records

---

## 4) Admin notification APIs

Base path: /api/admin/notifications

### 4.1 Get admin notifications

- Method: GET
- Endpoint: /api/admin/notifications/notifications
- Auth: required
- Response: admin notification list

### 4.2 Delete all admin notifications

- Method: DELETE
- Endpoint: /api/admin/notifications/notifications/all
- Auth: required
- Response: cleanup confirmation

---

## 5) Admin report APIs

Base path: /api/admin/reports

### 5.1 Get teacher report

- Method: GET
- Endpoint: /api/admin/reports/:teacherId
- Auth: required
- Response: teacher-specific report payload

---

## 6) Live superadmin class and course APIs

These are the active public endpoints that match the working app configuration and must remain unchanged.

### 6.1 Get class summary

- Method: GET
- Endpoint: /api/superadmin/classes
- Auth: required
- Response: aggregate class metrics

### 6.2 Get class hierarchy

- Method: GET
- Endpoint: /api/superadmin/classes/:id/hierarchy
- Auth: required
- Response: class -> subjects -> courses tree

### 6.3 Get courses by subject

- Method: GET
- Endpoint: /api/superadmin/subjects/:subjectCode/courses
- Auth: required
- Response: list of courses for a subject

### 6.4 Get course participants

- Method: GET
- Endpoint: /api/superadmin/courses/:courseCode/participants
- Auth: required
- Response: teachers and students for that course

### 6.5 Update course details

- Method: PATCH
- Endpoint: /api/superadmin/courses/:courseCode
- Auth: required
- Request body: course update fields
- Response: updated course record

---

## 7) Admin module organization

The current internal folder structure is:

- backend/admin/students
- backend/admin/teachers
- backend/admin/subscription
- backend/admin/reports
- backend/admin/notifications
- backend/admin/classes
- backend/admin/courses

This structure is intended for maintainability and to keep business logic separated by domain. The public route contract remains under the previously working production endpoints, especially /api/superadmin and the migrated internal admin routes if the app later mounts them explicitly.

---

## 8) Notes for frontend integration

- Frontend consumers should not depend on /api/admin unless it is mounted intentionally in the runtime app.
- The runtime contract for class/course administration remains /api/superadmin.
- Admin user flows for students, teachers, subscriptions, and notifications are implemented in the modular backend/admin structure and should be treated as module-specific backend internals unless the route mount is added later.

    "courseName": "Advanced Algebra",
    "courseDescription": "Advanced algebra concepts and problems",
    "difficulty": "Intermediate",
    "mrp": "6000.00",
    "discountedprice": "4000.00",
    "status": "ACTIVE"
  }
}
```

---

## Refactored Admin Student Management

These routes are implemented in `backend/admin/students` and are the refactored module endpoints.

### Get All Students

**Endpoint:** `GET /api/admin/students`

**Query parameters:**
- `page` (number, default: `1`)
- `limit` (number, default: `10`)
- `search` (string)
- `status` (string)
- `startDate` (string, `YYYY-MM-DD`)
- `endDate` (string, `YYYY-MM-DD`)

**Response (200 OK):**
```json
{
  "status": true,
  "message": "Students fetched successfully",
  "data": [
    {
      "id": 1,
      "studentId": "john20240101120000",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "status": "APPROVED",
      "country": "India",
      "parentName": "Jane Doe",
      "parentEmail": "jane@example.com"
    }
  ],
  "pagination": {
    "totalItems": 50,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 10
  }
}
```

---

### Get Student by ID

**Endpoint:** `GET /api/admin/students/:studentId`

**Response (200 OK):**
```json
{
  "status": true,
  "message": "Student fetched successfully",
  "data": {
    "id": 1,
    "studentId": "john20240101120000",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "status": "APPROVED"
  }
}
```

---

### Update Student Status

**Endpoint:** `PATCH /api/admin/students/:studentId/status`

**Request body:**
```json
{
  "status": "SUSPENDED"
}
```

**Allowed values:** `APPROVED`, `SUSPENDED`, `TERMINATED`

**Response (200 OK):**
```json
{
  "status": true,
  "message": "Student status updated successfully",
  "data": {
    "studentId": "john20240101120000",
    "status": "SUSPENDED"
  }
}
```

---

### Get Student Count

**Endpoint:** `GET /api/admin/students/count`

**Response (200 OK):**
```json
{
  "status": true,
  "message": "Student count fetched successfully",
  "data": {
    "count": 150
  }
}
```

---

### Delete Student

**Endpoint:** `DELETE /api/admin/students/:studentId`

**Behavior:** soft delete by setting the student status to `TERMINATED`

---

## Refactored Admin Teacher Management

These routes are implemented in `backend/admin/teachers`.

### Get All Teachers

**Endpoint:** `GET /api/admin/teachers`

**Query parameters:**
- `page` (number, default: `1`)
- `limit` (number, default: `10`)
- `search` (string)
- `status` (string)
- `startDate` (string, `YYYY-MM-DD`)
- `endDate` (string, `YYYY-MM-DD`)

**Response (200 OK):**
```json
{
  "status": true,
  "message": "Teachers fetched successfully",
  "data": [
    {
      "teacherId": "math20240101120000",
      "name": "Dr. Smith",
      "email": "smith@example.com",
      "mobile": "9876543210",
      "status": "APPROVED",
      "qualification": "M.Sc Mathematics",
      "coursename": ["Mathematics 10", "Mathematics 12"],
      "courseCode": ["MATH10", "MATH12"]
    }
  ],
  "pagination": {
    "totalItems": 25,
    "totalPages": 3,
    "currentPage": 1,
    "limit": 10
  }
}
```

---

### Update Teacher Status

**Endpoint:** `PATCH /api/admin/teachers/:teacherId/status`

**Allowed values:** `PENDING`, `APPROVED`, `SUSPENDED`, `TERMINATED`

---

### Get Teacher Count

**Endpoint:** `GET /api/admin/teachers/count`

**Response (200 OK):**
```json
{
  "status": true,
  "message": "Teacher count fetched successfully",
  "data": {
    "count": 25
  }
}
```

---

### Update Teacher Course Allocation

**Endpoint:** `PATCH /api/admin/teachers/:teacherId/courses`

**Request body:**
```json
{
  "coursename": ["Mathematics 10", "Science 10"]
}
```

**Response (200 OK):**
```json
{
  "status": true,
  "message": "Teacher course information updated successfully",
  "data": {
    "teacherId": "math20240101120000",
    "coursename": ["Mathematics 10", "Science 10"],
    "courseCode": ["MATH10", "SCI10"]
  }
}
```

---

### Delete Teacher

**Endpoint:** `DELETE /api/admin/teachers/:teacherId`

**Behavior:** soft delete by setting the teacher status to `TERMINATED`

---

## Error Handling

All endpoints return a standard error envelope when something fails:

```json
{
  "success": false,
  "status": false,
  "message": "Error message describing what went wrong"
}
```

Common status codes:
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

---

## Authentication

All admin-related routes require a JWT token in the `Authorization` header:

```text
Authorization: Bearer <jwt-token>
```

---

## Notes

- Public production endpoints remain on `/api/superadmin` for class/course operations.
- Refactored admin modules live in `backend/admin` and follow the controller/service/validation route pattern.
- Soft deletes do not physically remove records; they set status to `TERMINATED`.
- Pagination defaults are `page=1` and `limit=10`.
- Dates should be supplied in `YYYY-MM-DD` format.
- Course update operations whitelist allowed fields to avoid unintended changes.


