"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Mail, Phone, KeyRound, Eye, EyeOff, CheckCircle2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { API_FORGOT_PASSWORD_BASE, FORGOT_PASSWORD_PATHS } from "@/lib/api";

type Step = "identify" | "otp" | "reset" | "success";

const RESEND_DELAY = 30; // seconds

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("identify");
    const [identifier, setIdentifier] = useState("");
    const [role, setRole] = useState("student");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Resend timer
    const [resendCooldown, setResendCooldown] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isPhone = /^\d+$/.test(identifier) && identifier.length > 0;

    const startResendTimer = () => {
        setResendCooldown(RESEND_DELAY);
        timerRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return setError("Please enter your email or phone number.");
        setError("");
        setLoading(true);
        try {
            const body = { identifier, role };
            const res = await fetch(`${API_FORGOT_PASSWORD_BASE}${FORGOT_PASSWORD_PATHS.forgotPassword}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || (!data.status && !data.success)) throw new Error(data.message || "Could not send OTP.");
            setLoading(false);
            setStep("otp");
            startResendTimer();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            const body = { identifier, role };
            await fetch(`${API_FORGOT_PASSWORD_BASE}${FORGOT_PASSWORD_PATHS.forgotPassword}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        } catch { /* ignore */ } finally {
            setOtp(["", "", "", "", "", ""]);
            startResendTimer();
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) return setError("Please enter the full 6-digit OTP.");
        setError("");
        setLoading(true);
        try {
            const body = { identifier, otp: code, role };
            const res = await fetch(`${API_FORGOT_PASSWORD_BASE}${FORGOT_PASSWORD_PATHS.verifyForgotPasswordOtp}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || (!data.status && !data.success)) throw new Error(data.message || "Invalid OTP.");
            setLoading(false);
            setStep("reset");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Invalid OTP. Try again.");
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword) return setError("Passwords do not match.");
        setError("");
        setLoading(true);
        try {
            const body = { identifier, newPassword, role };
            const res = await fetch(`${API_FORGOT_PASSWORD_BASE}${FORGOT_PASSWORD_PATHS.resetPassword}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || (!data.status && !data.success)) throw new Error(data.message || "Reset failed.");
            setLoading(false);
            setStep("success");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
            setLoading(false);
        }
    };

    // OTP input handling
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
            {/* Animated BG blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-purple-200/40 to-pink-200/40 blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-[440px] z-10"
            >
                {/* Logo */}
                <div className="mb-10 flex justify-center">
                    <Link href="/" className="flex items-center gap-3">
                        <motion.div
                            className="flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/30"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                            <img src="/student/logo.png" alt="Live Mentor Hub Logo" className="w-full h-full object-contain" />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="font-bold text-2xl text-gray-900 tracking-tight leading-none">Live Mentor Hub</span>
                            <span className="text-xs text-gray-500 font-medium">Education Platform</span>
                        </div>
                    </Link>
                </div>

                <motion.div
                    className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-gray-900/5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <AnimatePresence mode="wait">

                        {/* ─── STEP 1: Enter email / phone ─── */}
                        {step === "identify" && (
                            <motion.div key="identify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <button onClick={() => router.push("/auth/login")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                                    <ArrowLeft className="h-4 w-4" /> Back to login
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                                <p className="mt-1 text-sm text-gray-500 mb-6">Enter your registered email or phone. We'll send you a verification code.</p>
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="relative">
                                        {isPhone
                                            ? <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        }
                                        <input
                                            type="text"
                                            placeholder="Email or phone number"
                                            value={identifier}
                                            onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <select
                                            value={role}
                                            onChange={(e) => { setRole(e.target.value); setError(""); }}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                                        >
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="parent">Parent</option>
                                        </select>
                                    </div>
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold">
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* ─── STEP 2: Enter OTP ─── */}
                        {step === "otp" && (
                            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <button onClick={() => setStep("identify")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                                    <ArrowLeft className="h-4 w-4" /> Change contact
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
                                <p className="mt-1 text-sm text-gray-500 mb-6">
                                    We sent a 6-digit code to <span className="font-semibold text-gray-700">{identifier}</span>
                                </p>
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="flex justify-center gap-2.5">
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { otpRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-900 bg-gray-50"
                                            />
                                        ))}
                                    </div>
                                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                                    {/* Resend timer */}
                                    <div className="text-center text-sm text-gray-500">
                                        Didn't receive it?{" "}
                                        {resendCooldown > 0 ? (
                                            <span className="text-gray-400 font-medium">Resend in <span className="text-indigo-600 font-bold">{resendCooldown}s</span></span>
                                        ) : (
                                            <button type="button" onClick={handleResendOtp} disabled={loading} className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 disabled:opacity-50">
                                                {loading ? "Sending..." : "Resend OTP"}
                                            </button>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={loading || otp.join("").length < 6} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold">
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify OTP"}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* ─── STEP 3: Reset Password ─── */}
                        {step === "reset" && (
                            <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Set New Password</h1>
                                <p className="text-sm text-gray-500 mb-6">Choose a strong password you haven't used before.</p>
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="New password"
                                            value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                                            className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                            className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {/* Password strength indicator */}
                                    {newPassword && (
                                        <div className="flex gap-1.5 mt-1">
                                            {[1, 2, 3, 4].map((lvl) => (
                                                <div key={lvl} className={cn("h-1.5 flex-1 rounded-full transition-all", {
                                                    "bg-red-400": newPassword.length >= lvl * 2 && newPassword.length < 8,
                                                    "bg-yellow-400": newPassword.length >= 8 && lvl <= 2,
                                                    "bg-green-400": newPassword.length >= 8 && lvl <= 3 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword),
                                                    "bg-emerald-500": newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword),
                                                    "bg-gray-200": newPassword.length < lvl * 2,
                                                })} />
                                            ))}
                                        </div>
                                    )}
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold mt-2">
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* ─── STEP 4: Success ─── */}
                        {step === "success" && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-5">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                    className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                                >
                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Password Reset!</h2>
                                    <p className="text-gray-500 text-sm mt-2">Your password has been updated successfully. You can now log in with your new password.</p>
                                </div>
                                <Button onClick={() => router.push("/auth/login")} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">
                                    Back to Login
                                </Button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
}
