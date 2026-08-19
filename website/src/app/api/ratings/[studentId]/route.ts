import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/ratings/${studentId}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch ratings data" },
      { status: 500 }
    );
  }
}
