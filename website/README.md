# 🌐 LiveMentorHub — Main Public Website & Institute Network

The **LiveMentorHub Main Website** is built using **Next.js 16 (App Router)** and **Turbopack**, serving as the public landing platform, course catalog showcase, institute partner onboarding network, and brand center.

---

## 🏗️ Technical Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript (`.tsx`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Environment Key**: `NEXT_PUBLIC_BACKEND_URL`

---

## 📂 Feature Module Layout

```text
website/src/
├── app/
│   ├── page.tsx          # Homepage
│   ├── about/            # About Us Page
│   ├── contact/          # Contact Form Page
│   ├── courses/          # Course Catalog Page
│   ├── get-started/      # Role Portal Selection Page
│   ├── institute/        # Institute Network & Onboarding Page
│   └── (legal)/          # Terms, Privacy & Cookies Pages
├── components/           # Navbar, Footer, AnnouncementBar, Toast, ScrollToTop
├── features/             # Feature Components for pages
└── lib/                  # API Client & Data Configuration
```

---

## 🚀 Build & Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev      # Runs Next.js dev server at http://localhost:3000

# 3. Build for production
npm run build    # Compiles Next.js 16 production build
```
