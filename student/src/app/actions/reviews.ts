"use server";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function submitReviewAction({
    studentId,
    courseId,
    rating,
    comment,
    token,
}: {
    studentId: string;
    courseId: string;
    rating: number;
    comment: string;
    token: string;
}) {
    if (!studentId || !courseId || rating === undefined) {
        throw new Error("Missing required fields");
    }

    if (!token) {
        throw new Error("Authentication token is missing.");
    }

    if (!BACKEND_BASE) {
        throw new Error("BACKEND_URL is not defined in environment variables.");
    }

    const backendPayload = {
        studentId,
        courseCode: courseId,
        ratingNumber: rating,
        ratingComment: comment ?? "",
    };

    const url = `${BACKEND_BASE}/api/reviews`;
    console.log(`[submitReviewAction] Dispatching to ${url} with payload:`, backendPayload);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backendPayload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        console.error("[submitReviewAction] Backend error response:", data);
        throw new Error(data.error || res.statusText || "Failed to submit review");
    }

    return data;
}

export async function checkHasReviewedAction({
    studentId,
    courseId,
    token,
}: {
    studentId: string;
    courseId: string;
    token: string;
}) {
    if (!studentId || !courseId || !token || !BACKEND_BASE) {
        return false;
    }

    try {
        const url = `${BACKEND_BASE}/api/reviews/has-reviewed`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                studentId,
                courseCode: courseId,
            }),
        });

        if (!res.ok) {
            return false;
        }

        const data = await res.json();
        console.log("has reviewed response",data)
        return !!data.hasReviewed;
    } catch (err) {
        console.error("Error checking review status:", err);
        return false;
    }
}

export async function getCourseReviewsAction(courseId: string) {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!courseId || !backendBase) {
        console.error("[getCourseReviewsAction] Missing courseId or backend URL");
        return null;
    }

    try {
        const url = `${backendBase}/api/courses/${courseId}/reviews`;
        
        const headers: Record<string, string> = {
            Accept: "application/json",
        };
        const token = localStorage.getItem("cp_token");
        
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[getCourseReviewsAction] Failed with status ${res.status}:`, errorText);
            return null;
        }

        return await res.json();
    } catch (err) {
        console.error("[getCourseReviewsAction] Exception caught:", err);
        return null;
    }
}
