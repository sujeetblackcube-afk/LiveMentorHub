import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/common/AnnouncementBar";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { LivvyAssistant } from "@/components/common/LivvyAssistant";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://livementorhub.com";

export const viewport: Viewport = {
  themeColor: "#fafbfe",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LiveMentorHub - Confidence changes the way you learn.",
    template: "%s | LiveMentorHub",
  },
  description:
    "Real stories from learners and families who use LiveMentorHub to ask more, understand better and make steady progress. India's unified live mentorship & coaching platform.",
  keywords: [
    "LiveMentorHub",
    "live mentorship",
    "coaching institute software",
    "online classes India",
    "parent tracking portal",
  ],
  authors: [{ name: "LiveMentorHub Team", url: siteUrl }],
  creator: "LiveMentorHub",
  publisher: "LiveMentorHub Inc.",
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "LiveMentorHub",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "India's unified live mentorship, coaching, and parent progress tracking ecosystem.",
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-[#fafbfe] text-slate-900 antialiased selection:bg-blue-600 selection:text-white flex flex-col relative`}
      >
        {/* Background Grid Pattern across entire website */}
        <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#0d1f5c15_1px,transparent_1px),linear-gradient(to_bottom,#0d1f5c15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col flex-1">
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <LivvyAssistant />
        </div>
      </body>
    </html>
  );
}
