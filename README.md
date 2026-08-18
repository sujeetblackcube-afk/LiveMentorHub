# 🎓 LiveMentorHub Ecosystem

> **LiveMentorHub** is an enterprise-grade live online mentorship and course management ecosystem designed to empower students, teachers, and administrators.

---

## 🏗️ Architecture Overview

The codebase is organized into three decoupled frontend applications:

```text
LiveMentorHub/
├── admin/                 # 🛡️ Super-Admin & Management Portal (Vite + React 19)
├── teacher/               # 👨‍🏫 Educator & Class Management Portal (Vite + React 19)
├── student/               # 🎓 Student Learning Portal & Public Site (Next.js 16 App Router)
├── .gitignore             # Monorepo global ignore configuration
└── README.md              # Master ecosystem documentation
```

---

## ⚡ Key Highlights & Benchmarks

* **Domain-Driven Feature Layout**: Pages and components organized inside `src/features/<domain>/`.
* **Modular CSS Separation**: Feature-isolated styling (`student.css`, `course.css`, `dashboard.css`).
* **Blazing Fast Vite & Turbopack Builds**:
  * `admin` build: **~5.4 seconds** (Down from 37.49s, **>85% speedup**)
  * `teacher` build: **~5.4 seconds** (Down from 19.84s, **>72% speedup**)
  * `student` build: **~4.5 seconds** (19/19 static & dynamic routes)
* **Application State Feedback**: Integrated `LoadingState`, `EmptyState`, `ErrorState`, `NoNetworkState`, `SlowNetworkState`.
* **Global Error Boundaries**: Graceful exception catching (`ErrorBoundary.jsx` / `ErrorBoundary.tsx`).
* **Interactive File Management**: Unified `FileUploadZone` (upload progress bar, format detection) and `FileDownloadZone` (PDF/Excel exports with toast notifications).

---

## ⚙️ Quick Start Instructions

### 1. Admin Portal (`/admin`)
```bash
cd admin
npm install
npm run dev      # Runs dev server on http://localhost:5173/admin
npm run build    # Generates optimized production bundle in dist/
```

### 2. Teacher Portal (`/teacher`)
```bash
cd teacher
npm install
npm run dev      # Runs dev server on http://localhost:5174/teacher
npm run build    # Generates optimized production bundle in dist/
```

### 3. Student Portal (`/student`)
```bash
cd student
npm install
npm run dev      # Runs Next.js dev server on http://localhost:3000
npm run build    # Generates Next.js 16 production build
npm run start    # Launches production server
```

---

## 🔒 Environment Configuration

Create a `.env` file inside each directory:

```env
# Backend Base API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
VITE_BACKEND_BASE_URL=http://localhost:5000
```
