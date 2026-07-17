"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Code, FileText, CircleCheck, Wallet, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/useAuth";
import { load } from "@cashfreepayments/cashfree-js";
import { API_BASE, ENROLLMENT_PATHS } from "@/lib/api";

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    courseCode: string;
    price: number;
    courseTitle: string;
    currencySymbol?: string;
    originalPrice?: number;
}

export function EnrollmentModal({ isOpen, onClose, onSuccess, courseCode, price, courseTitle, currencySymbol = "₹", originalPrice }: EnrollmentModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        studentId: "",
        remarks: ""
    });

    // Get studentId from auth on mount
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            studentId: user?.studentId || localStorage.getItem("studentId") || ""
        }));
    }, [user]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setLoading(false);
            setError(null);
            
            // Refresh studentId - ensure it's always a string
            const id = user?.studentId || localStorage.getItem("studentId") || "";
            setFormData({
                studentId: id,
                remarks: ""
            });
        }
    }, [isOpen, user]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.studentId) {
            setError("Student ID is required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("cp_token");
            
            // Map currency symbol to currency code
            const currencyMap: Record<string, string> = {
                "₹": "inr",
                "د.إ": "aed",
                "$": "usd",
                "€": "eur",
                "£": "gbp",
                "د.ك": "kwd",
                "ر.س": "sar"
            };
            const currency = currencyMap[currencySymbol] || "inr";

            const response = await fetch(`${API_BASE}${ENROLLMENT_PATHS.createCashfreeOrder}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    amount: price,
                    currency: currency,
                    studentId: formData.studentId,
                    courseCode: courseCode,
                    metadata: {
                        courseTitle,
                        studentName: user?.name || "Student"
                    }
                })
            });

            const data = await response.json();

            if (data.success && data.payment_session_id) {
                // Initialize Cashfree
                const cashfree = await load({
                    mode: "production" // Production as per user instructions
                });

                // Start Cashfree checkout process
                const checkoutOptions = {
                    paymentSessionId: data.payment_session_id,
                    redirectTarget: "_self" // Cashfree standard is to redirect on success/failure
                };
                
                await cashfree.checkout(checkoutOptions);
            } else {
                throw new Error(data.message || "Failed to initialize payment");
            }
        } catch (error) {
            console.error("Payment initialization error:", error);
            setError(error instanceof Error ? error.message : "Failed to initialize payment");
            setLoading(false);
        }
    };

    // Calculate discount percentage
    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gray-900 px-6 py-5 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white">Course Enrollment</h2>
                                <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{courseTitle}</p>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="text-gray-400 hover:text-white transition-colors"
                                disabled={loading}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && step !== 'success' && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {step === 'form' && (
                            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500 mb-2">Review your enrollment details</p>

                                    {/* Student ID (Read-only) */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Student ID</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData.studentId}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 outline-none cursor-not-allowed font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Course Code (Read-only) */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Course Code</label>
                                        <div className="relative">
                                            <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                readOnly
                                                value={courseCode}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 outline-none cursor-not-allowed font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="h-5 border-l-4 border-indigo-600 pl-3 flex items-center">
                                            <span className="font-bold text-indigo-600">Payment Details</span>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Amount</label>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-500">Original Price</span>
                                                <span className="text-gray-400 line-through">
                                                    {currencySymbol}{(originalPrice || price).toFixed(2)}
                                                </span>
                                            </div>
                                            {discount > 0 && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-500">Discount</span>
                                                    <span className="text-green-600 font-semibold">{discount}% OFF</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Total</span>
                                                <span className="text-xl font-bold text-indigo-600">
                                                    {currencySymbol}{price.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remarks (Editable) */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Remarks <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <textarea
                                                placeholder="Any specific requests or notes"
                                                value={formData.remarks}
                                                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                                rows={2}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-300 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !formData.studentId}
                                    className="w-full h-14 bg-gray-800 hover:bg-gray-900 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Initializing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="h-5 w-5" />
                                            Proceed to Payment
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}

                        {step === 'success' && (
                            <div className="p-8 text-center space-y-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <CircleCheck className="h-12 w-12" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-900">Enrollment Successful!</h3>
                                    <p className="text-gray-500">
                                        Your payment has been processed successfully. You now have access to {courseTitle}.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        A confirmation email has been sent to your registered email address.
                                    </p>
                                </div>
                                <div className="space-y-3 pt-4">
                                    <Button 
                                        onClick={onClose} 
                                        className="w-full h-12 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        Continue Exploring
                                    </Button>
                                    <Button 
                                        onClick={onClose}
                                        variant="outline"
                                        className="w-full h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Go to My Courses
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
