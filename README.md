# 🎓 LiveMentorHub Ecosystem

> **LiveMentorHub** is an enterprise-grade live online mentorship, institute, and course management ecosystem designed to empower students, parents, teachers, institutes, and administrators across India.

---

## 🏗️ Architecture Overview

The codebase is organized into dedicated decoupled applications matching modern sub-path deployment patterns:

| Project | Role / Purpose | Base Route | Framework & Language |
| :--- | :--- | :--- | :--- |
| **`website/`** | Public Landing Page, Pricing, Institute Network & Legal Pages | `/` | Next.js 16 App Router (TSX) |
| **`student/`** | Student & Parent Learning Vault & Live Mentorship Portal | `/student/` | Vite + React 19 (Pure JavaScript `.jsx`) |
| **`teacher/`** | Educator WebRTC Studio, Broadcasts & Notes | `/teacher/` | Vite + React 19 (Pure JavaScript `.jsx`) |
| **`admin/`** | Super Admin Operations Control Panel & Approvals | `/admin/` | Vite + React 19 (Pure JavaScript `.jsx`) |
| **`backend/`** | Core Node.js / Express API, Cashfree Webhooks & Database | `/api/` | Express 5 / Sequelize |

---

## 🔑 Environment Configuration

All projects share a single, unified environment variable key:

```env
# Local Development
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Production Deployment
# NEXT_PUBLIC_BACKEND_URL=https://livementorhub.com
```

---

## 📁 Ecosystem Folder Layout

```text
LiveMentorHub/
├── README.md                      # Master Ecosystem Documentation
├── website/                       # Main Public Landing & Institute Web Application (Next.js 16)
│   ├── public/                    # Logos & Brand Images
│   ├── src/                       # Next.js App Router (pages, features, components)
│   ├── .env.example
│   └── README.md
├── student/                       # Student & Parent Portal (Vite + React JSX)
│   ├── src/                       # React Router DOM (auth, dashboard, courses, doubts)
│   ├── vite.config.js
│   ├── .env.example
│   └── README.md
├── teacher/                       # Educator WebRTC Studio Portal (Vite + React JSX)
│   ├── src/                       # React Router DOM (auth, live sessions, tests, profile)
│   ├── .env.example
│   └── README.md
├── admin/                         # Super Admin Command Portal (Vite + React JSX)
│   ├── src/                       # React Router DOM (student, teacher, parent approvals, payouts)
│   ├── .env.example
│   └── README.md
└── backend/                       # Express / Sequelize Backend Server
    ├── src/                       # Express App, Master Router, Cashfree Webhooks
    ├── .env.example
    └── README.md
```

---

## 🚀 Quick Start Instructions

### 1. Main Website (`/website`)
```bash
cd website
npm install
npm run dev      # Runs on http://localhost:3000
```

### 2. Student & Parent Portal (`/student`)
```bash
cd student
npm install
npm run dev      # Runs Vite server on http://localhost:5173/student/
```

### 3. Teacher Studio (`/teacher`)
```bash
cd teacher
npm install
npm run dev      # Runs Vite server on http://localhost:5174/teacher/
```

### 4. Admin Portal (`/admin`)
```bash
cd admin
npm install
npm run dev      # Runs Vite server on http://localhost:5173/admin/
```

### 5. Backend Server (`/backend`)
```bash
cd backend
npm install
npm run dev      # Runs Express API on http://localhost:5000
```
