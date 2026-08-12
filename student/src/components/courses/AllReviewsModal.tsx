"use client";

import { useState, useEffect } from "react";
import { getCourseReviewsAction } from "@/app/actions/reviews";

interface Review {
    reviewId: number;
    studentId: string;
    studentName: string;
    profileImage: string | null;
    ratingNumber: number;
    ratingComment: string;
    timestamp: string;
}

export const AllReviewsModal = ({ courseId }: { courseId: string }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showAll, setShowAll] = useState<boolean>(false);

    useEffect(() => {
        async function fetchReviews() {
            if (!courseId) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await getCourseReviewsAction(courseId);
                console.log("reviews are as follows : ", data);
                if (data && data.reviews) {
                    // Sort reviews by timestamp descending (latest first)
                    const sortedReviews = data.reviews.sort(
                        (a: Review, b: Review) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );
                    setReviews(sortedReviews);
                    setAverageRating(data.averageRating || 0);
                    setTotalReviews(data.totalReviews || 0);
                }
            } catch (error) {
                console.error("Failed to load reviews:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchReviews();
    }, [courseId]);

    if (isLoading) {
        return (
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 my-8 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-sm animate-pulse">
                    <svg className="w-4 h-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading reviews...
                </div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 my-8">
                <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    No reviews yet for this course. Be the first to review!
                </div>
            </div>
        );
    }

    // Top 3 latest reviews
    const topReviews = reviews.slice(0, 3);
    // Displayed reviews depend on the "showAll" toggle
    const displayedReviews = showAll ? reviews : topReviews;

    return (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 my-8 space-y-6">
            {/* Header Section */}
            <div className="flex flex-row justify-between items-center pb-2 border-b border-slate-100">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        Student Reviews
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {totalReviews} {totalReviews === 1 ? "review" : "reviews"} recorded
                    </p>
                </div>
                {averageRating > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-900 px-3.5 py-1.5 rounded-full border border-amber-500/20 text-sm font-semibold shadow-xs">
                        <span className="text-amber-500 text-base leading-none">★</span>
                        <span>{averageRating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal text-xs">/ 5.0</span>
                    </div>
                )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {displayedReviews.map((review) => (
                    <div 
                        key={review.reviewId} 
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-3"
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center space-x-3.5">
                                {review.profileImage ? (
                                    <img 
                                        src={review.profileImage} 
                                        alt={review.studentName} 
                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                        {review.studentName ? review.studentName.charAt(0).toUpperCase() : "S"}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm capitalize">
                                        {review.studentName}
                                    </h4>
                                    <span className="text-xs text-slate-400">
                                        {new Date(review.timestamp).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Stars representation */}
                            <div className="flex space-x-0.5 text-amber-400 text-base leading-none">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star}>
                                        {star <= review.ratingNumber ? "★" : "☆"}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {review.ratingComment && (
                            <p className="text-slate-600 text-sm sm:pl-13 leading-relaxed font-normal">
                                {review.ratingComment}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Show More / Show Less Toggle Button */}
            {reviews.length > 3 && (
                <div className="pt-2 text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98]"
                    >
                        <span>{showAll ? "Show Less" : `Show More (${reviews.length - 3} more reviews)`}</span>
                        <svg className={`w-4 h-4 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};
