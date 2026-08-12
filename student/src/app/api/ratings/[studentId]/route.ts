import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const { studentId } = await params;
    if (!studentId) {
        console.error("[reviews proxy POST] Missing studentId in route params");
        return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { courseId, reviewNumber, reviewComment } = body;

        if (!courseId || reviewNumber === undefined) {
            console.error("[reviews proxy POST] Missing required fields in body:", { courseId, reviewNumber });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Map frontend fields to backend /api/reviews payload requirements
        const backendPayload = {
            studentId,
            courseCode: courseId,
            ratingNumber: reviewNumber,
            ratingComment: reviewComment ?? "",
        };

        const url = `${BACKEND_BASE}/api/reviews`;
        console.log(`[reviews proxy POST] Dispatching POST to ${url} with payload:`, backendPayload);

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(backendPayload),
        });

        const data = await res.json().catch(() => ({}));
        
        if (!res.ok) {
            console.error("[reviews proxy POST] Backend responded with error status:", {
                status: res.status,
                statusText: res.statusText,
                errorBody: data,
            });
            return NextResponse.json(data || { error: res.statusText }, { status: res.status });
        }

        console.log("[reviews proxy POST] Successfully posted review:", data);
        return NextResponse.json(data);
    } catch (err) {
        console.error("[reviews proxy POST] Exception caught during fetch or parsing:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Backend unreachable or invalid request" },
            { status: 502 }
        );
    }
}
