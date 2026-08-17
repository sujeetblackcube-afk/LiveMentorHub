# Authentication API Documentation

This document provides complete API documentation for all authentication endpoints in LiveMentorHub.

## Table of Contents
- [Base URL](#base-url)
- [Authentication Methods](#authentication-methods)
- [Error Handling](#error-handling)
- [Signup Endpoints](#signup-endpoints)
- [Login Endpoints](#login-endpoints)
- [OTP Management](#otp-management)
- [Password Reset](#password-reset)
- [Session Management](#session-management)

---

## Base URL

```
http://localhost:5000/api/auth
```

## Authentication Methods

### Bearer Token
Most endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Error Handling

All endpoints return a standard error response format:

```json
{
  "status": false,
  "message": "Error message here",
  "reason": "Detailed error reason (optional)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `500` - Server Error

---

## Signup Endpoints

### 1. Student Signup

**Endpoint:** `POST /register/student`

**Description:** Create a new student account. Sends OTP for email verification.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "parentName": "Jane Doe",
  "parentEmail": "jane@example.com",
  "parentMobile": "9876543211",
  "password": "securePassword123",
  "gender": "Male",
  "country": "India",
  "address": "123 Main Street",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "playerId": "player_123",
  "deviceType": "Android"
}
```

**Required Fields:**
- `name` - Student's full name
- `email` - Student's email (unique)
- `mobile` - Student's mobile number (unique)
- `parentName` - Parent's name
- `parentEmail` - Parent's email (must match sibling's parent email if sibling already registered)
- `parentMobile` - Parent's mobile (must match sibling's parent mobile if sibling already registered)
- `password` - Minimum 6 characters

**Optional Fields:**
- `country` - Country of residence
- `gender` - Male/Female/Other
- `address` - Residential address
- `latitude` - Geographical latitude
- `longitude` - Geographical longitude
- `playerId` - Push notification player ID
- `deviceType` - Device OS (Android/iOS)

**Response (Success - 201):**
```json
{
  "status": true,
  "message": "OTP generated successfully and sent to your email",
  "studentId": "john20250817123456789",
  "expiresAt": "2025-08-17T14:30:00Z"
}
```

**Response (Already Sent OTP - 200):**
```json
{
  "status": true,
  "message": "OTP already sent. Please verify to complete registration",
  "studentId": "john20250817123456789",
  "expiresAt": "2025-08-17T14:30:00Z"
}
```

**Error Responses:**
- `400` - Email/Mobile already registered in another role
- `400` - Parent email/mobile mismatch with siblings
- `400` - Password required
- `500` - Server error

---

### 2. Teacher Signup

**Endpoint:** `POST /register/teacher`

**Description:** Create a new teacher account. Sends OTP for email verification.

**Request Body:**
```json
{
  "name": "Dr. Smith",
  "email": "smith@example.com",
  "mobile": "9876543220",
  "password": "securePassword123",
  "qualification": "B.Tech in Computer Science",
  "gender": "Male",
  "country": "India",
  "address": "456 School Street",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "playerId": "player_456",
  "deviceType": "iOS"
}
```

**Required Fields:**
- `name` - Teacher's full name
- `email` - Teacher's email (unique)
- `mobile` - Teacher's mobile number (unique)
- `password` - Minimum 6 characters
- `qualification` - Educational qualification
- `gender` - Male/Female/Other

**Optional Fields:**
- `country` - Country of residence
- `address` - Residential address
- `latitude` - Geographical latitude
- `longitude` - Geographical longitude
- `playerId` - Push notification player ID
- `deviceType` - Device OS (Android/iOS)

**Response (Success - 201):**
```json
{
  "status": true,
  "message": "OTP generated successfully and sent to your email",
  "teacherId": "smith20250817987654321",
  "expiresAt": "2025-08-17T14:30:00Z"
}
```

**Note:** Teacher account starts in "PENDING" status and requires admin approval before login.

---

### 3. Parent Signup

**Endpoint:** `POST /register/parent`

**Description:** Create a new parent account. Sends OTP for email verification.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "mobile": "9876543211",
  "password": "securePassword123",
  "address": "123 Main Street",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "playerId": "player_789",
  "deviceType": "Android"
}
```

**Required Fields:**
- `name` - Parent's full name
- `email` - Parent's email (unique)
- `mobile` - Parent's mobile number (unique)
- `password` - Minimum 6 characters

**Optional Fields:**
- `address` - Residential address
- `latitude` - Geographical latitude
- `longitude` - Geographical longitude
- `playerId` - Push notification player ID
- `deviceType` - Device OS (Android/iOS)

**Response (Success - 201):**
```json
{
  "status": true,
  "message": "OTP generated successfully and sent to your email",
  "parentId": "jane20250817111111111",
  "expiresAt": "2025-08-17T14:30:00Z"
}
```

---

### 4. Super Admin Signup

**Endpoint:** `POST /register/superadmin`

**Description:** Create a new super admin account.

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "mobile": "9876543212",
  "password": "securePassword123",
  "address": "Admin Office",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "playerId": "player_admin",
  "deviceType": "Web"
}
```

**Required Fields:**
- `name` - Admin's full name
- `email` - Admin's email (unique)
- `mobile` - Admin's mobile number (unique)
- `password` - Minimum 6 characters

**Response (Success - 201):**
```json
{
  "status": true,
  "message": "SuperAdmin registered successfully and OTP sent to your email",
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Login Endpoints

### 1. User Login

**Endpoint:** `POST /login`

**Description:** Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "password": "securePassword123",
  "role": "student",
  "playerId": "player_123",
  "deviceType": "Android",
  "forceLogout": false
}
```

**Required Fields:**
- `identifier` - Email or mobile number
- `password` - User password
- `role` - User role: `student`, `teacher`, `parent`, or `superadmin`

**Optional Fields:**
- `playerId` - Push notification player ID
- `deviceType` - Device type for tracking
- `forceLogout` - Force logout from other devices (students only)

**Response (Success - 200):**
```json
{
  "status": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "student",
  "enrollmentStatus": 1,
  "isDeviceActive": true,
  "isActiveDevice": true,
  "isSessionActive": true,
  "user": {
    "userId": 1,
    "studentId": "john20250817123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "profileImage": null,
    "status": "APPROVED"
  }
}
```

**Response (Active Session Found - 200):**
```json
{
  "status": false,
  "activeSessionFound": true,
  "message": "An active session is currently logged in on another device. Do you want to log out from the other device and continue?"
}
```

**Error Responses:**
- `404` - User not found
- `401` - Incorrect password
- `403` - Account suspended/terminated
- `403` - OTP not verified
- `400` - Invalid role

**Special Cases:**
- **Students:** 
  - Requires OTP verification before login
  - Single device session enforcement
  - Enrollment status returned (0 = not enrolled, 1 = enrolled)
  
- **Teachers:**
  - Status must be "APPROVED" or "ACTIVE" (not "PENDING")
  - Requires OTP verification
  
- **Parents:**
  - Status must be "APPROVED"
  - On first login: must reset password (get 403 with reset password message)
  
- **Super Admin:**
  - No additional restrictions

---

## OTP Management

### 1. Verify OTP

**Endpoint:** `POST /verify-otp`

**Description:** Verify OTP sent during signup. Completes registration process.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "otp": "123456",
  "role": "student"
}
```

**Required Fields:**
- `identifier` - Email or mobile used during signup
- `otp` - 6-digit OTP sent to email
- `role` - User role

**Response (Success - 200):**
```json
{
  "status": true,
  "message": "Account verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "student"
}
```

**Error Responses:**
- `404` - User not found
- `400` - Account already verified
- `400` - Invalid OTP
- `400` - OTP expired

**Note:** Token returned can be used to login without entering password.

---

### 2. Resend OTP

**Endpoint:** `POST /resend-otp`

**Description:** Resend OTP if user didn't receive it or OTP expired.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "role": "student"
}
```

**Required Fields:**
- `identifier` - Email or mobile
- `role` - User role

**Response (Success - 200):**
```json
{
  "status": true,
  "message": "OTP resent successfully",
  "otp": "123456"
}
```

**Error Responses:**
- `404` - User not found
- `500` - Failed to send OTP

**Note:** Remove OTP from response in production for security.

---

## Password Reset

### 1. Forgot Password

**Endpoint:** `POST /forgot-password`

**Description:** Initiate password reset process. Sends OTP to registered email.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "role": "student"
}
```

**Required Fields:**
- `identifier` - Email or mobile
- `role` - User role

**Response (Success - 200):**
```json
{
  "status": true,
  "message": "OTP generated for password reset and sent to your email",
  "identifier": "john@example.com",
  "role": "student",
  "expiresAt": "2025-08-17T14:30:00Z"
}
```

**Error Responses:**
- `404` - User not found

---

### 2. Verify Forgot Password OTP

**Endpoint:** `POST /verify-forgot-password-otp`

**Description:** Verify OTP for password reset. Must be done before resetting password.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "otp": "123456",
  "role": "student"
}
```

**Required Fields:**
- `identifier` - Email or mobile
- `otp` - OTP sent to email
- `role` - User role

**Response (Success - 200):**
```json
{
  "status": true,
  "message": "OTP verified successfully. You can now reset your password."
}
```

**Error Responses:**
- `404` - User not found
- `400` - Invalid or expired OTP

---

### 3. Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Reset user password after OTP verification.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "role": "student",
  "newPassword": "newSecurePassword456"
}
```

**Required Fields:**
- `identifier` - Email or mobile
- `role` - User role
- `newPassword` - New password (minimum 6 characters)

**Response (Success - 200):**
```json
{
  "status": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `404` - User not found
- `403` - OTP not verified

**Note:** Password must be at least 6 characters long.

---

## Session Management

### 1. Verify Token

**Endpoint:** `GET /verify-token`

**Headers:**
```
Authorization: Bearer <token>
```

**Description:** Verify JWT token validity and get user information.

**Response (Success - 200):**
```json
{
  "status": true,
  "message": "Token is valid and active",
  "isDeviceActive": true,
  "isActiveDevice": true,
  "isSessionActive": true,
  "user": {
    "userId": 1,
    "studentId": "john20250817123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "status": "APPROVED"
  }
}
```

**Error Responses:**
- `401` - Invalid or expired token

---

### 2. Check Session

**Endpoint:** `GET /check-session`

**Headers:**
```
Authorization: Bearer <token>
```

**Description:** Alias for verify-token endpoint. Same functionality.

**Response:** Same as verify-token

---

### 3. Logout

**Endpoint:** `POST /logout`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Description:** Logout user and clear active session.

**Response (Success - 200):**
```json
{
  "status": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `500` - Logout failed

**Note:** For students, this clears the active token, allowing login from another device.

---

## Frontend Developer Quick Reference

### Token Storage
Store the JWT token securely (localStorage/sessionStorage for web, secure storage for mobile):

```javascript
// After successful login or OTP verification
localStorage.setItem('authToken', response.token);
localStorage.setItem('userRole', response.role);
```

### Using Token in Requests
Always include token in Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
};

fetch('http://localhost:5000/api/auth/verify-token', {
  method: 'GET',
  headers: headers
});
```

### Complete Signup Flow
1. Call appropriate signup endpoint (`/register/student`, etc.)
2. Receive OTP in email
3. Call `/verify-otp` with OTP
4. Store returned token
5. Use token for authenticated requests

### Complete Login Flow
1. Call `/login` with credentials
2. Check if `activeSessionFound` is true (students only)
3. If active session and user confirms, pass `forceLogout: true`
4. Store returned token
5. Use token for authenticated requests

### Complete Password Reset Flow
1. Call `/forgot-password` with email/mobile and role
2. User receives OTP in email
3. Call `/verify-forgot-password-otp` to verify OTP
4. Call `/reset-password` with new password
5. User can now login with new password

### Error Handling Best Practices
```javascript
try {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  const data = await response.json();

  if (data.status) {
    // Success
    localStorage.setItem('authToken', data.token);
  } else {
    // Show error message
    console.error(data.message, data.reason);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Environment Variables Required

```env
# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary (for profile images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=livementorhub
```

---

## Security Notes

1. **Never expose tokens** - Store securely on client
2. **Use HTTPS in production** - Prevent token interception
3. **Token expiry** - Implement token refresh mechanism
4. **Password requirements** - Enforce strong passwords
5. **Rate limiting** - Implement on login/OTP endpoints
6. **Email verification** - Always verify email before account activation
7. **Session tracking** - Log all login attempts with IP addresses

---

## Version History

- **v1.0** (2025-08-17) - Initial authentication module refactor
  - Separated concerns into controller, service, routes
  - Added comprehensive validation layer
  - Implemented single-device login for students
  - Added documentation for all endpoints

