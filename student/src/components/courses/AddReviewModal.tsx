"use client";

import { useState, useEffect } from "react";
import { isEnrolledIn } from "@/lib/courseData";
import { submitReviewAction, checkHasReviewedAction } from "@/app/actions/reviews";

export const AddReviewModal = ({
    courseId,
    hasReviewed: hasReviewedProp,
}: {
    courseId: string;
    hasReviewed?: boolean;
}) => {
    const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
    const [hasReviewed, setHasReviewed] = useState<boolean>(hasReviewedProp === true);
    const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(hasReviewedProp === true ? false : true);
    const [showForm, setShowForm] = useState<boolean>(false);
    
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    
    // Snackbar state
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

    useEffect(() => {
        if (hasReviewedProp === true) {
            setHasReviewed(true);
            setIsLoadingStatus(false);
            return;
        }

        async function verifyStatus() {
            if (!courseId) {
                setIsLoadingStatus(false);
                return;
            }

            const enrolledStatus = isEnrolledIn(courseId);
            setIsEnrolled(enrolledStatus);

            if (!enrolledStatus) {
                setIsLoadingStatus(false);
                return;
            }

            const studentId = localStorage.getItem("studentId");
            const token = localStorage.getItem("cp_token");

            if (studentId && token) {
                try {
                    const reviewed = await checkHasReviewedAction({
                        studentId,
                        courseId,
                        token,
                    });
                    setHasReviewed(reviewed);
                } catch (error) {
                    console.error("Failed to check review status:", error);
                }
            }

            setIsLoadingStatus(false);
        }

        verifyStatus();
    }, [courseId, hasReviewedProp]);

    // Auto-dismiss snackbar after 3 seconds
    useEffect(() => {
        if (snackbarMessage) {
            const timer = setTimeout(() => {
                setSnackbarMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [snackbarMessage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            alert("Please select at least 1 star for your rating.");
            return;
        }

        const studentId = localStorage.getItem("studentId");
        const token = localStorage.getItem("cp_token");

        if (!studentId || !token) {
            alert("Authentication details not found. Please log in again.");
            return;
        }

        try {
            await submitReviewAction({
                studentId,
                courseId,
                rating,
                comment,
                token,
            });

            // Close form, reset values, flag as reviewed, and show snackbar
            setShowForm(false);
            setComment("");
            setRating(0);
            setHasReviewed(true); // Hide button immediately after successful submission
            setSnackbarMessage("Review Submitted Successfully!");
        } catch (error) {
            console.error("Error submitting review:", error);
            alert(error instanceof Error ? error.message : "Failed to submit review. Please try again.");
        }
    };

    // Hide component if not enrolled, still loading status, or already reviewed
    if (!isEnrolled || isLoadingStatus || hasReviewed) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-6 flex justify-center">
            <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Add Rating
            </button>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-100 space-y-6 transform transition-all scale-100">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Add Your Review</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Share your feedback to help future learners</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center text-lg font-semibold transition"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Rating <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center space-x-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 justify-around sm:justify-start">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`text-3xl focus:outline-none transition-transform active:scale-125 hover:scale-110 ${
                                                star <= rating ? "text-amber-400 drop-shadow-sm" : "text-slate-200 hover:text-amber-200"
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Comment
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition placeholder:text-slate-400 resize-none"
                                    rows={4}
                                    placeholder="Write your thoughts about the course..."
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-[0.98] transition font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition font-medium text-sm shadow-md shadow-indigo-500/20"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Snackbar Notification */}
            {snackbarMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 transition-all animate-in slide-in-from-bottom-5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/50 flex items-center justify-center text-xs font-bold">
                        ✓
                    </div>
                    <span className="font-medium text-sm">{snackbarMessage}</span>
                </div>
            )}
        </div>
    );
};
