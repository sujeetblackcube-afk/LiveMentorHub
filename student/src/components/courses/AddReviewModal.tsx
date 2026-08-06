"use client";

import { useState, useEffect } from "react";
import { isEnrolledIn } from "@/lib/courseData";
import { submitReviewAction, checkHasReviewedAction } from "@/app/actions/reviews";

export const AddReviewModal = ({ courseId }: { courseId: string }) => {
    const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
    const [hasReviewed, setHasReviewed] = useState<boolean>(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    
    // Snackbar state
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

    useEffect(() => {
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
    }, [courseId]);

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
        <div className="mt-2 ml-4 mb-6">
            <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
            >
                Add Rating
            </button>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Add Your Review</h3>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating <span className="text-red-500">*</span>
                                </label>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${
                                                star <= rating ? "text-yellow-400" : "text-gray-300"
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comment
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    rows={4}
                                    placeholder="Write your thoughts about the course..."
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium shadow-sm"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Snackbar Notification */}
            {snackbarMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2 transition-all">
                    <span className="text-xl">✓</span>
                    <span className="font-medium">{snackbarMessage}</span>
                </div>
            )}
        </div>
    );
};
