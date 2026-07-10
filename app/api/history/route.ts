import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getSessionHistory } from "@/lib/db/complimentSets";

export async function GET(request: NextRequest) {
  const sessionId = getSessionId(request);

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session not found.", sets: [] },
      { status: 200 }
    );
  }

  try {
    const sets = await getSessionHistory(sessionId, 50);
    return NextResponse.json({ sets }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/history]", err);
    return NextResponse.json(
      { error: "Failed to fetch history.", sets: [] },
      { status: 500 }
    );
  }
}
