import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const COOKIE_NAME = "sessionId";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Read the sessionId cookie, or create a new UUID and set it on the response.
 * Returns { sessionId, response } — the response must be returned from the route
 * handler so the Set-Cookie header is applied.
 */
export function getOrCreateSessionId(
  request: NextRequest,
  existingResponse: NextResponse
): { sessionId: string; response: NextResponse } {
  const existing = request.cookies.get(COOKIE_NAME)?.value;

  if (existing) {
    return { sessionId: existing, response: existingResponse };
  }

  const sessionId = uuidv4();
  existingResponse.cookies.set(COOKIE_NAME, sessionId, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    httpOnly: false, // Must be readable by client-side analytics (per AGENT.md §5)
    sameSite: "lax",
  });

  return { sessionId, response: existingResponse };
}

/**
 * Read-only: get sessionId from cookie, or return null if absent.
 */
export function getSessionId(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null;
}
