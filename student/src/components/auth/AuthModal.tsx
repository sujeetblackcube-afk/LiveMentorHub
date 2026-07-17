"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { toast } from "react-toastify";
import { X, Mail, Lock, User, ArrowRight, Smartphone, MapPin, Phone, GraduationCap, UserCircle2 } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModal";
import { useAuth } from "@/store/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { API_AUTH_BASE, AUTH_PATHS } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

export function AuthModal() {
    const { isOpen, view, close, openLogin, openSignup, openForgotPassword } = useAuthModal();
    const { login } = useAuth();
    const router = useRouter();

    /* ── Shared state ── */
    const [role, setRole] = useState<"student" | "parent">("student");
    const [isPhoneAuth, setIsPhoneAuth] = useState(false);
    const [step, setStep] = useState<'request' | 'otp' | 'reset'>('request');

    /* ── Refs ── */
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const loginEmailRef = useRef<HTMLInputElement>(null);
    const loginPasswordRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ── Scroll lock ── */
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        if (!isOpen) setTimeout(() => setStep('request'), 300);
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    /* ── Forgot-password sub-steps ── */
    const handleSendOTP = () => setStep('otp');
    const handleVerifyOTP = () => setStep('reset');
    const handleResetPassword = () => { openLogin(); setStep('request'); };

    /* ── Auth actions ── */
    const handleCreateAccount = () => {
        // Redirect to specialized signup page for full experience
        close();
        router.push("/auth/signup");
    };

    const handleLogin = async () => {
        const identifier = loginEmailRef.current?.value;
        const password = loginPasswordRef.current?.value;
        if (!identifier || !password) {
            setError("Please enter both email/phone and password.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_AUTH_BASE}${AUTH_PATHS.login}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password, role }),
            });
            const data = await res.json();
            if (!res.ok || data?.status === false) {
                const message =
                    data?.message ||
                    (res.status === 404
                        ? "Email or mobile not found."
                        : res.status === 401
                        ? "Incorrect password."
                        : "Login failed. Please check your credentials.");
                throw new Error(message);
            }

            const userObj = data.user || data.userData || {};
            const studentId = userObj.studentId || data.studentId || userObj.userId || data.userId || data.specificId || "";
            const country = userObj.country || "";

            login({
                name: userObj.name || identifier.split("@")[0],
                email: userObj.email || identifier,
                studentId: studentId,
                country: country
            });
            // Also store studentId separately in localStorage for easier access
            if (studentId) {
                localStorage.setItem("studentId", studentId);
            }
            if (country) {
                localStorage.setItem("country", country);
            }
            if (data.token) localStorage.setItem("cp_token", data.token);
            toast.success("Logged in successfully!");
            close();
            router.push("/dashboard");
        } catch (err: any) {
            const message = err?.message || "Something went wrong.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (view === 'login') return role === 'student' ? 'Welcome Back!' : 'Parent Portal';
        if (view === 'signup') return 'Create Account';
        if (view === 'forgot-password') return 'Reset Password';
        return '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div onClick={close} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Card */}
            <div className={`relative w-full ${view === 'signup' ? 'max-w-2xl' : view === 'forgot-password' ? 'max-w-[480px]' : 'max-w-[440px]'} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
                {/* Top gradient bar */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0" />

                {/* Close Button */}
                <button
                    onClick={close}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-8 pt-7 overflow-y-auto scrollbar-hide">
                    {/* Error Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                            >
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl mb-4 shadow-indigo-200 shadow-lg">
                            C+
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{getTitle()}</h2>
                        <p className="text-gray-500 mt-1.5 text-sm">
                            {view === 'login' && 'Continue your learning journey with Live Mentor Hub'}
                            {view === 'signup' && 'Join thousands of students learning on Live Mentor Hub'}
                            {view === 'forgot-password' && "Enter your details to verify it's you"}
                        </p>
                    </div>

                    {/* ── Role Selector (Login only) ── */}
                    {view === 'login' && (
                        <LayoutGroup>
                            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-1.5 ring-1 ring-gray-200/50">
                                {(["student", "parent"] as const).map((r) => {
                                    const isSelected = role === r;
                                    const Icon = r === "student" ? GraduationCap : UserCircle2;
                                    return (
                                        <motion.button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={cn(
                                                "relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all outline-none",
                                                isSelected ? "text-white" : "text-gray-600 hover:text-gray-800"
                                            )}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="roleIndicator"
                                                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30"
                                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center gap-2">
                                                <Icon className="h-4 w-4" strokeWidth={2.5} />
                                                {r.charAt(0).toUpperCase() + r.slice(1)}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </LayoutGroup>
                    )}

                    {/* Form */}
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (view === 'signup') handleCreateAccount();
                            if (view === 'login') handleLogin();
                        }}
                    >
                        {/* ── SIGNUP FORM ── */}
                        {view === 'signup' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Student Info */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input ref={nameRef} placeholder="Student Name" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input ref={emailRef} type="email" placeholder="student@example.com" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input placeholder="98765 43210" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                    </div>
                                </div>

                                {/* Parent Info */}
                                <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-gray-100 mt-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Parent Details</p>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Parent Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input placeholder="Parent Name" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Parent Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input type="email" placeholder="parent@example.com" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Parent Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input placeholder="Parent Phone" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                    </div>
                                </div>

                                {/* Address & Password */}
                                <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-gray-100 mt-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Security & Address</p>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <textarea
                                            placeholder="Full Address"
                                            className="w-full pl-10 p-3 h-20 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input type="password" placeholder="••••••••" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input type="password" placeholder="••••••••" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                    </div>
                                </div>

                                {/* Create Account CTA */}
                                <div className="md:col-span-2 flex justify-center">
                                    <Button
                                        type="submit"
                                        onClick={handleCreateAccount}
                                        className="w-full max-w-sm h-12 rounded-xl text-base font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-200 mt-2"
                                    >
                                        Create Account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* ── LOGIN FORM ── */}
                        {view === 'login' && (
                            <>
                                {/* Email/Phone toggle */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsPhoneAuth(!isPhoneAuth)}
                                        className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                                    >
                                        Use {isPhoneAuth ? 'Email' : 'Phone'} instead
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">
                                        {isPhoneAuth ? 'Phone Number' : 'Email Address'}
                                    </label>
                                    <div className="relative">
                                        {isPhoneAuth ? (
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        )}
                                        <Input
                                            ref={loginEmailRef}
                                            type={isPhoneAuth ? 'tel' : 'email'}
                                            placeholder={isPhoneAuth ? '98765 43210' : role === 'parent' ? 'parent@example.com' : 'john@example.com'}
                                            className={`h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl ${isPhoneAuth ? 'pl-24' : 'pl-10'}`}
                                        />
                                        {isPhoneAuth && (
                                            <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center h-full">
                                                <span className="text-gray-500 text-sm font-medium border-r border-gray-300 pr-2 mr-2 h-5 flex items-center">+91</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-semibold text-gray-700">Password</label>
                                        <button
                                            type="button"
                                            onClick={openForgotPassword}
                                            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            ref={loginPasswordRef}
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-200 mt-2"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {role === 'parent' ? 'Continue as Parent' : 'Login'}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </>
                        )}

                        {/* ── FORGOT PASSWORD ── */}
                        {view === 'forgot-password' && (
                            <>
                                {step === 'request' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700 ml-1">Email or Phone</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input placeholder="Enter your registered email or phone" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                            </div>
                                        </div>
                                        <Button onClick={handleSendOTP} className="w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg">
                                            Send OTP
                                        </Button>
                                    </div>
                                )}
                                {step === 'otp' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700 ml-1">Enter 6-digit OTP</label>
                                            <div className="flex gap-2 justify-center">
                                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                                    <Input key={i} className="w-10 h-12 text-center text-lg font-bold bg-gray-50 border-gray-200 rounded-lg p-0" maxLength={1} />
                                                ))}
                                            </div>
                                        </div>
                                        <Button onClick={handleVerifyOTP} className="w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg">
                                            Verify OTP
                                        </Button>
                                        <button onClick={() => setStep('request')} className="w-full text-center text-xs font-medium text-gray-500 hover:text-gray-900">
                                            Resend OTP or change number
                                        </button>
                                    </div>
                                )}
                                {step === 'reset' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700 ml-1">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input type="password" placeholder="New Password" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700 ml-1">Confirm New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input type="password" placeholder="Confirm New Password" className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl" />
                                            </div>
                                        </div>
                                        <Button onClick={handleResetPassword} className="w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg">
                                            Reset Password
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </form>

                    {/* Footer Switcher */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        {view === 'login' && (
                            <>
                                Don&apos;t have an account?{' '}
                                <button onClick={openSignup} className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">Sign Up</button>
                            </>
                        )}
                        {view === 'signup' && (
                            <>
                                Already have an account?{' '}
                                <button onClick={openLogin} className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">Log In</button>
                            </>
                        )}
                        {view === 'forgot-password' && (
                            <button onClick={openLogin} className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">Back to Login</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
