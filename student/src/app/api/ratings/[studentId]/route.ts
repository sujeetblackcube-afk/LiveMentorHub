import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const { studentId } = await params;
    if (!studentId) {
        return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { courseId, reviewNumber, reviewComment } = body;

        if (!courseId || reviewNumber === undefined) {
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
            return NextResponse.json(data || { error: res.statusText }, { status: res.status });
        }

        
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Backend unreachable or invalid request" },
            { status: 502 }
        );
    }
}
