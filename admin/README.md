# 🛡️ LiveMentorHub — Admin Portal

The **Admin Portal** provides comprehensive control over student approvals, educator verifications, parent management, course catalogs, batches, payouts, and system metrics.

---

## 📂 Feature Module Layout

```text
admin/src/features/
├── auth/          # Login & Admin Authentication
├── dashboard/     # Metric Cards & Revenue Charts
├── student/       # Approved, Suspended, and Terminated Students
├── teacher/       # Approved, Pending, Suspended, and Terminated Teachers
├── parent/        # Approved, Suspended, and Terminated Parents
├── course/        # Course Catalog, Batches, Live Classes & Syllabus
├── enrollment/    # Student Enrollments & Invoices
├── finance/       # Educator Payouts & Subscriptions
└── management/    # CMS Broadcasts & Contact Inquiries
```

---

## 🚀 Build Commands

```bash
npm run dev      # Launch Vite development server
npm run build    # Compile production bundle (<5.5s build time)
npm run preview  # Preview production build locally
```
