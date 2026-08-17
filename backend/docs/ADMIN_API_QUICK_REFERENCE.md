# Admin API Quick Reference

## Base URL
```
/api/admin
```

**All endpoints require authentication (JWT Bearer token)**

---

## Admin Students

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/students` | Get all students (paginated) | ✓ |
| GET | `/students/count` | Get student count | ✓ |
| GET | `/students/:studentId` | Get student details | ✓ |
| PATCH | `/students/:studentId/status` | Update student status | ✓ |
| DELETE | `/students/:studentId` | Soft delete student | ✓ |

### Query Parameters
```
GET /api/admin/students?page=1&limit=10&search=John&status=APPROVED&startDate=2024-01-01&endDate=2024-12-31
```

### Status Values
- `APPROVED`
- `SUSPENDED`
- `TERMINATED`

---

## Admin Teachers

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/teachers` | Get all teachers (paginated) | ✓ |
| GET | `/teachers/count` | Get teacher count | ✓ |
| PATCH | `/teachers/:teacherId/status` | Update teacher status | ✓ |
| PATCH | `/teachers/:teacherId/courses` | Allocate courses | ✓ |
| DELETE | `/teachers/:teacherId` | Soft delete teacher | ✓ |

### Status Values
- `PENDING`
- `APPROVED`
- `SUSPENDED`
- `TERMINATED`

### Allocate Courses
```json
{
  "coursename": ["Mathematics 10", "Science 10"]
}
```

---

## Admin Courses

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/courses/classes` | Get class statistics | ✓ |
| GET | `/courses/classes/:classId/hierarchy` | Get class hierarchy | ✓ |
| GET | `/courses/subjects/:subjectCode/courses` | Get subject courses | ✓ |
| GET | `/courses/:courseCode/participants` | Get course participants | ✓ |
| PATCH | `/courses/:courseCode` | Update course details | ✓ |

---

## Common Request/Response Examples

### Update Student Status
```bash
curl -X PATCH http://localhost:5000/api/admin/students/john20240101120000/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "SUSPENDED"}'
```

### Get Teachers with Pagination
```bash
curl http://localhost:5000/api/admin/teachers?page=1&limit=10&status=APPROVED \
  -H "Authorization: Bearer <token>"
```

### Allocate Courses to Teacher
```bash
curl -X PATCH http://localhost:5000/api/admin/teachers/math20240101120000/courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"coursename": ["Mathematics 10"]}'
```

### Update Course Pricing
```bash
curl -X PATCH http://localhost:5000/api/admin/courses/MATH10A \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mrp": "6000",
    "discountedprice": "4000",
    "difficulty": "Intermediate"
  }'
```

---

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid parameters or validation failed |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Resource (student/teacher/course) doesn't exist |
| 500 | Server Error | Internal server error |

---

## Allowed Course Update Fields

```
courseName, courseDescription, courseType, difficulty,
mrp, discountedprice, status, deadline, courseStartDate,
courseDuration, board, medium, classname, subject, stream,
category, subcategory, targetAudience, totalLessons,
thumbnail, introVideo
```

---

## Notes

- Deletes are **soft deletes** (status marked TERMINATED, not physically removed)
- Default pagination: page=1, limit=10
- Date format: YYYY-MM-DD
- All responses include `status`, `message`, and `data` fields
- Prices returned as strings with 2 decimal places
