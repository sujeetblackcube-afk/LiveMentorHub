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
                console.log("reviews are as follows : ",data)
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
        return <div className="text-sm text-gray-500 py-4">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return <div className="text-sm text-gray-500 py-4">No reviews yet for this course. Be the first to review!</div>;
    }

    // Top 3 latest reviews
    const topReviews = reviews.slice(0, 3);
    // Displayed reviews depend on the "showAll" toggle
    const displayedReviews = showAll ? reviews : topReviews;

    return (
        <div className="space-y-4 my-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                    Student Reviews ({totalReviews})
                </h3>
                {averageRating > 0 && (
                    <div className="flex items-center space-x-1 text-sm font-medium text-gray-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        <span className="text-yellow-500 text-lg">★</span>
                        <span>{averageRating.toFixed(1)} / 5.0</span>
                    </div>
                )}
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
                {displayedReviews.map((review) => (
                    <div 
                        key={review.reviewId} 
                        className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-2 transition hover:shadow-md"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                                {review.profileImage ? (
                                    <img 
                                        src={review.profileImage} 
                                        alt={review.studentName} 
                                        className="w-9 h-9 rounded-full object-cover border"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                                        {review.studentName ? review.studentName.charAt(0).toUpperCase() : "S"}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-medium text-gray-800 text-sm capitalize">{review.studentName}</h4>
                                    <span className="text-xs text-gray-400">
                                        {new Date(review.timestamp).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Stars representation */}
                            <div className="flex space-x-0.5 text-yellow-400 text-sm">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star}>
                                        {star <= review.ratingNumber ? "★" : "☆"}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {review.ratingComment && (
                            <p className="text-gray-600 text-sm pl-12 leading-relaxed">
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
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition focus:outline-none"
                    >
                        {showAll ? "Show Less" : `Show More (${reviews.length - 3} more reviews)`}
                    </button>
                </div>
            )}
        </div>
    );
};
