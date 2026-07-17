"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Live Mentor Hub. Learning for students and parents.
          </p>
          <nav className="flex gap-6 text-sm">
            <Link href="/courses" className="text-gray-500 hover:text-gray-900">
              Courses
            </Link>
            <Link href="/live" className="text-gray-500 hover:text-gray-900">
              Live
            </Link>
            <Link href="/doubt" className="text-gray-500 hover:text-gray-900">
              Doubts
            </Link>
            <Link href="/progress" className="text-gray-500 hover:text-gray-900">
              Progress
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
