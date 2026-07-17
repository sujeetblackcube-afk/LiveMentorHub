# ClassPlus - Modern Education Platform Frontend

A beautiful, modern education platform built with Next.js 16, React 19, and Tailwind CSS 4.

## 🚀 Features

- **Modern UI/UX**: Clean, professional design with smooth animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Course Management**: Browse, enroll, and track progress in courses
- **Live Classes**: Join live sessions with real-time updates
- **Assignments**: Submit and track assignment progress
- **Doubts & Q&A**: Ask questions and get help from instructors
- **Progress Tracking**: Visual progress indicators and analytics
- **Settings**: Customizable themes (Light/Dark/System) and preferences

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4.1.18
- **Animations**: Framer Motion 12.34.0
- **Icons**: Lucide React
- **UI Components**: Custom components with Radix UI primitives
- **TypeScript**: Full type safety

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js and deploy

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI primitives
│   │   └── layout/           # Layout components
│   ├── data/                 # Mock data
│   └── lib/                  # Utilities
├── public/                   # Static assets
└── package.json
```

## 🎨 Key Pages

- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/dashboard` - Main dashboard
- `/courses` - Course catalog
- `/courses/[id]` - Course details
- `/live` - Live classes
- `/assignments` - Assignments
- `/doubt` - Doubts & Q&A
- `/progress` - Progress tracking
- `/settings` - User settings
- `/profile` - User profile

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Add your environment variables here
# NEXT_PUBLIC_API_URL=https://your-api-url.com
```

### Tailwind CSS

The project uses Tailwind CSS 4 with custom configuration in `tailwind.config.ts`.

## 🎯 Development

```bash
# Run development server
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

## 📝 License

Private - All rights reserved

## 👥 Author

ClassPlus Team

---

Built with ❤️ using Next.js and Tailwind CSS
