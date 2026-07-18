"use client";

import { X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthModal } from "@/store/useAuthModal";
import { useAuth } from "@/store/useAuth";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const AUTH_NAV_LINKS = [
    { label: "Home", href: "/dashboard" },
    { label: "Courses", href: "/courses" },
    { label: "Live", href: "/live" },
    { label: "Doubt", href: "/doubt" },
    { label: "Profile", href: "/settings" },
];

const GUEST_NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Course", href: "/courses?demo=true" },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { openLogin, openSignup } = useAuthModal();
    const { isAuthenticated, logout } = useAuth();

    const handleLogin = () => {
        onClose();
        openLogin();
    };

    const handleSignup = () => {
        onClose();
        openSignup();
    };

    const NAV_LINKS = isAuthenticated ? AUTH_NAV_LINKS : GUEST_NAV_LINKS;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: "100%" }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: "100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed inset-0 z-50 bg-[#0d1f5c]"
                >
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4940a] text-[#0d1f5c] font-bold text-sm">
                                    LM
                                </div>
                                <span className="font-bold text-xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>Live Mentor Hub</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Links */}
                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                            {NAV_LINKS.map((link, idx) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 + 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={onClose}
                                        className="flex items-center justify-between p-4 rounded-xl text-lg font-medium text-white/70 hover:bg-white/5 hover:text-[#d4940a] transition-colors group"
                                    >
                                        <span>{link.label}</span>
                                        <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-[#d4940a] transition-colors" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-white/10 space-y-3">
                            {isAuthenticated ? (
                                <Button
                                    onClick={() => {
                                        logout();
                                        window.location.href = "/";
                                        onClose();
                                    }}
                                    variant="outline"
                                    className="w-full h-12 text-base border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 rounded-xl"
                                >
                                    Log Out
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={() => { onClose(); window.location.href = "/auth/login"; }} variant="outline" className="w-full h-12 text-base border-white/20 text-[#0d1f5c] hover:bg-white/5 hover:text-white hover:border-white/30 rounded-xl">
                                        Log In
                                    </Button>
                                    <Button onClick={() => { onClose(); window.location.href = "/auth/signup"; }} className="w-full h-12 text-base bg-[#d4940a] hover:bg-[#e8a020] text-[#0d1f5c] font-bold rounded-xl shadow-lg shadow-[#d4940a]/20">
                                        Create Free Account
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
