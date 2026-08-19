# ⚙️ LiveMentorHub — Backend Server API

The **Backend API Server** is built using **Node.js, Express, and Sequelize ORM**, handling user authentication, Cashfree payment webhooks, course management, WebRTC RTC tokens, and database operations.

---

## 🏗️ Technical Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **ORM / Database**: Sequelize (PostgreSQL / SQLite)
- **Payment Gateway**: Cashfree Payment Gateway & Webhooks (`/api/cashfree-webhook`)
- **Real-Time Video**: Agora RTC Access Token Generator

---

## 📂 Backend Architecture

```text
backend/src/
├── app.js               # Express Application Initialization & Global Middleware
├── server.js            # Node HTTP Server Listener
├── config/              # Database & Cloudinary Configuration
├── middleware/          # JWT Auth, RBAC Role Guards, Rate Limiting
├── modules/             # Domain Feature Modules
│   ├── authentication/  # Student, Parent, Teacher Login & OTP Verification
│   ├── student/         # Student Enrollments, Tests, Notes, Doubts
│   ├── teacher/         # Teacher Live Sessions, Assignments, Earnings
│   ├── admin/           # SuperAdmin Approvals, Metrics, Payouts
│   └── shared/          # Courses, Banners, Content, Contact Us
└── routes/              # Master Router Index (index.js)
```

---

## 🚀 Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server with live reload
npm run dev      # Runs nodemon server on http://localhost:5000

# 3. Start production server
npm start        # Runs Node server on http://localhost:5000
```
