import { NextRequest, NextResponse } from "next/server";

/** Backend base for course page data — path is android/coursepagedata/:userId (no /api). */
const COURSE_BACKEND_BASE =
    process.env.NEXT_PUBLIC_COURSE_API_BASE ?? process.env.BACKEND_URL ?? "https://clussplus.auby.in";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const { studentId } = await params;
    if (!studentId) {
        return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }
    const url = `${COURSE_BACKEND_BASE}/api/android/coursepagedata/${studentId}`;
    try {
        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            next: { revalidate: 60 },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return NextResponse.json(data || { error: res.statusText }, { status: res.status });
        }
        return NextResponse.json(data);
    } catch (err) {
        console.error("[coursepagedata proxy]", err);
        return NextResponse.json(
            { error: "Backend unreachable" },
            { status: 502 }
        );
    }
}
