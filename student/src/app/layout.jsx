import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthModal } from "@/components/auth/AuthModal";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthListener } from "@/components/AuthListener";

export const metadata = {
  metadataBase: new URL("https://livementorhub.com"),
  title: {
    default: "LiveMentorHub | Interactive Online Learning & Live Student Mentorship",
    template: "%s | LiveMentorHub",
  },
  description:
    "Empowering students with 1-on-1 live mentorship, interactive online classes, real-time doubt solving, and structured course roadmaps.",
  keywords: [
    "live mentorship",
    "online learning platform",
    "student portal",
    "live tutoring",
    "doubt resolution",
    "course progress",
    "interactive classes",
  ],
  authors: [{ name: "LiveMentorHub Team" }],
  creator: "LiveMentorHub",
  publisher: "LiveMentorHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "LiveMentorHub | Interactive Online Learning & Live Student Mentorship",
    description:
      "Join thousands of students achieving academic excellence through live classes and expert mentorship.",
    url: "https://livementorhub.com",
    siteName: "LiveMentorHub",
    images: [
      {
        url: "/image.png",
        width: 1200,
        height: 630,
        alt: "LiveMentorHub Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiveMentorHub | Interactive Online Learning & Live Student Mentorship",
    description:
      "Join thousands of students achieving academic excellence through live classes and expert mentorship.",
    images: ["/image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import ErrorBoundary from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-white font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <ErrorBoundary>
          <AuthListener />
          {children}
          <AuthModal />
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  );
}
