"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/store/useAuth";

interface SectionBannerProps {
    sectionName: string;
}

export function SectionBanner({ sectionName }: SectionBannerProps) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) return null;

    return (
        <div className="bg-[#fff8e6] border border-[#f5d070] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="h-10 w-10 bg-[#d4940a]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-[#d4940a]" />
            </div>
            <div className="flex-1">
                <p className="text-[15px] text-[#5c4a16] font-medium leading-relaxed">
                    You are viewing <strong>{sectionName}</strong> in <strong>Guest Mode</strong>.{" "}
                    <span className="opacity-80">Sign in to sync your progress and access personalized materials.</span>
                </p>
                <div className="mt-2 flex items-center gap-3">
                    <Link 
                        href="/auth/login" 
                        className="text-[#0d1f5c] text-sm font-bold hover:underline decoration-2 underline-offset-4"
                    >
                        Log in now
                    </Link>
                    <span className="text-[#f5d070]">|</span>
                    <Link 
                        href="/auth/signup" 
                        className="text-sm font-bold text-[#d4940a] hover:underline decoration-2 underline-offset-4"
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
}
