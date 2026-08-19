# 🎓 LiveMentorHub — Student Portal

The **Student Portal** is built using **Vite + React 19 JavaScript (`.jsx`)**, delivering a fast, responsive student learning dashboard, live HD mentorship classes, notes, recorded video vault, mock test scorecards, and doubt resolution.

---

## 🏗️ Technical Stack

- **Framework**: React 19 + Vite 7
- **Router**: React Router DOM v7 (`basename="/student"`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **State & Data Fetching**: Context API & Axios
- **Environment Key**: `NEXT_PUBLIC_BACKEND_URL`

---

## 📂 Feature Module Layout

```text
student/src/
├── app/
│   ├── auth/          # Student Login & Signup Pages
│   └── (dashboard)/   # Student Learning Dashboard & Classes
├── components/        # Layout, Navbar, Footer & Common UI Widgets
├── features/          # Course, Doubt, Test & Assessment Features
├── lib/               # API Client & Helper Utilities
└── routes/            # AppRoutes.jsx & ProtectedRoute.jsx
```

---

## 🚀 Build & Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev      # Runs Vite dev server at http://localhost:5173/student/

# 3. Build for production
npm run build    # Compiles Vite production bundle to /dist
```
