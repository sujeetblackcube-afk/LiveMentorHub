# 🎓 LiveMentorHub — Student Portal & Public Landing Site

The **Student Portal** is built using **Next.js 16 (App Router)** and **Turbopack**, delivering a high-converting public landing page, SEO Metadata, OpenGraph cards, JSON-LD Schema, and interactive student learning dashboards.

---

## 📂 Feature Module Layout

```text
student/src/
├── app/
│   ├── (dashboard)/   # Student Learning Dashboard & Classes
│   ├── courses/       # Public Course Showcases
│   ├── auth/          # Student Login & Signup Modals
│   ├── robots.ts      # Dynamic Robots.txt for Search Indexers
│   └── sitemap.ts     # Dynamic Sitemap.xml Generator
└── features/
    ├── landing/       # Landing Page, Hero & Testimonial Styles
    ├── auth/          # Auth Components & CSS
    ├── course/        # Course Cards & Showcases
    ├── dashboard/     # Student Widgets & Progress Charts
    └── assessment/    # Assignment Submissions & Test Attempts
```

---

## 🚀 Build Commands

```bash
npm run dev      # Launch Next.js dev server on http://localhost:3000
npm run build    # Compile Next.js 16 production build (~4.5s compile time)
npm run start    # Start production server
```
