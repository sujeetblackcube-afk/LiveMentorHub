# Live Mentor Hub

A comprehensive mentor-student marketplace and learning hub containing portals for Students, Teachers, and Administrators, backed by a Node.js Express backend.

## Project Structure

This is a multi-project workspace consisting of the following applications:

*   **`backend/`**: Node.js & Express API server. Integrates PostgreSQL, JWT auth, Cashfree & Stripe payment gateways, Agora video/audio calls, Twilio SMS/OTP services, OneSignal push notifications, and Cloudinary storage.
*   **`student/`**: Student portal built with Next.js, React, and Tailwind CSS.
*   **`teacher/`**: Teacher portal built with React, Vite, and Tailwind CSS.
*   **`admin/`**: Admin dashboard built with React, Vite, and Tailwind CSS.

---

## Getting Started

Follow these instructions to get the entire project up and running locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [PostgreSQL](https://www.postgresql.org/) database
*   [Git](https://git-scm.com/)

---

## Configuration

Before running the applications, you must configure the environment variables for each project.

Copy the `.env.example` file in each directory to `.env` and fill in the required keys:

1.  **Backend Configuration**:
    ```bash
    cd backend
    cp .env.example .env
    ```
    *Fill in database connection details, JWT secret, and integration credentials.*

2.  **Student Portal Configuration**:
    ```bash
    cd student
    cp .env.example .env
    ```

3.  **Teacher Portal Configuration**:
    ```bash
    cd teacher
    cp .env.example .env
    ```

4.  **Admin Portal Configuration**:
    ```bash
    cd admin
    cp .env.example .env
    ```

---

## Installation and Running

You need to install dependencies for each project before running it.

### Running the Backend Server
```bash
cd backend
npm install
npm run dev # Runs server on http://localhost:5000
```

### Running the Student Portal (Next.js)
```bash
cd student
npm install
npm run dev # Runs on http://localhost:3000
```

### Running the Teacher Portal (Vite)
```bash
cd teacher
npm install
npm run dev # Runs on http://localhost:5173 (or similar Vite port)
```

### Running the Admin Portal (Vite)
```bash
cd admin
npm install
npm run dev # Runs on http://localhost:5173 (or similar Vite port)
```

---

## Key Features & Technologies

*   **Agora SDK**: Real-time video/audio conferencing for online mentoring sessions.
*   **Payment Gateways**: Double-integration of **Stripe** (for international/card payments) and **Cashfree** (for Indian local payments).
*   **OneSignal Notification**: Real-time push notification system for updates, class bookings, and system alerts.
*   **Twilio SMS & OTP Verification**: Secure phone verification with dynamic country-flag selector on signup.
*   **Cloudinary Storage**: Fast and optimized asset delivery for course content and profile attachments.
*   **Secure Authentication**: JWT-based stateless authentication with secure session handling.

## Git Ignored Files
All `.env` files are ignored by `.gitignore` in each subdirectory and root directory to prevent local and environment credentials from leaking to GitHub.
