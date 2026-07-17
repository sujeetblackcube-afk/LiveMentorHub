"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Calendar, HelpCircle, Menu, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Tests", href: "/tests", icon: PenTool },
    { name: "Live", href: "/live", icon: Calendar },
    { name: "Doubts", href: "/doubt", icon: HelpCircle },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white pb-safe lg:hidden">
            <div className="grid h-16 grid-cols-5 font-medium">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group",
                                isActive ? "text-indigo-600" : "text-gray-500"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6 mb-1 transition-colors", isActive ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-700")} />
                            <span className="text-xs">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
