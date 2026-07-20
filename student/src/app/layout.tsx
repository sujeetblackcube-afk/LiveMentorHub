import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthModal } from "@/components/auth/AuthModal";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthListener } from "@/components/AuthListener";

const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Live Mentor Hub",
  description: "Track progress, join live classes, and manage assignments with ease.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${nunitoSans.variable}`}>
      <body className={`${nunitoSans.className} h-full bg-white`}>
        <AuthListener />
        {children}
        <AuthModal />
        <ToastProvider />
      </body>
    </html>
  );
}
