"use client";

import { Bell, Menu } from "lucide-react";

interface HeaderProps {
    title?: string;
    showMenu?: boolean;
}

export default function Header({ title = "EdTech App", showMenu = false }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {showMenu && <Menu className="w-5 h-5 text-gray-600" />}
                <h1 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h1>
            </div>
            <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
        </header>
    );
}
