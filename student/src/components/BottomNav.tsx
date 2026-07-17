"use client";

import { Home, BookOpen, Video, BarChart2, User, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Live", href: "/live", icon: Video },
  { name: "Doubt", href: "/doubt", icon: HelpCircle },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center pointer-events-none">
      <div
        className="w-full max-w-[420px] border-t border-gray-200 pointer-events-auto py-2"
        style={{ backgroundColor: "var(--nav-bg)" }}
      >
        <div className="flex justify-between items-center px-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full py-1 rounded-lg",
                  isActive ? "text-[#3a90f8]" : "text-gray-500"
                )}
              >
                <tab.icon
                  size={24}
                  className={cn("mb-1", isActive && "stroke-[2.5]")}
                />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
