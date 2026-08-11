import type { Metadata } from "next";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthModal } from "@/components/auth/AuthModal";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthListener } from "@/components/AuthListener";

export const metadata: Metadata = {
  title: "Live Mentor Hub",
  description: "Track progress, join live classes, and manage assignments with ease.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-white font-sans">
        <AuthListener />
        {children}
        <AuthModal />
        <ToastProvider />
      </body>
    </html>
  );
}
