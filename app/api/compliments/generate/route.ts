import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Filter } from "bad-words";
import { getModel } from "@/lib/gemini/client";
import {
  buildGenerationUserTurn,
  RESPONSE_SCHEMA,
} from "@/lib/gemini/prompts";
import { createComplimentSet, ComplimentAngle } from "@/lib/db/complimentSets";
import { logEvent } from "@/lib/db/analytics";
import { getOrCreateSessionId } from "@/lib/session";
import { getDb } from "@/lib/db/mongodb";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequestBody {
  name: string;
  jobTitle: string;
  location: string;
  favoriteMeal: string;
  uniqueThing: string;
}

interface GeminiCompliment {
  angle: ComplimentAngle;
  text: string;
}

// ─── Rate limiting (MongoDB TTL) ──────────────────────────────────────────────

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 1 hour cooldown window
const RATE_LIMIT_MAX = 2; // max 2 generations per session per window

async function checkRateLimit(sessionId: string): Promise<boolean> {
  const db = await getDb();
  const col = db.collection("rateLimitGenerations");

  // Ensure TTL index exists (idempotent)
  await col.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: RATE_LIMIT_WINDOW_SECONDS, background: true }
  );

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000);
  const count = await col.countDocuments({
    sessionId,
    createdAt: { $gte: windowStart },
  });

  if (count >= RATE_LIMIT_MAX) return false;

  await col.insertOne({ sessionId, createdAt: new Date() });
  return true;
}

// ─── Validation helpers ────────────────────────────────────────────────────────

const filter = new Filter();

function validateBody(body: unknown): {
  valid: boolean;
  data?: RequestBody;
  error?: string;
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required." };
  }

  const b = body as Record<string, unknown>;
  const fields: (keyof RequestBody)[] = [
    "name",
    "jobTitle",
    "location",
    "favoriteMeal",
    "uniqueThing",
  ];

  for (const field of fields) {
    const val = b[field];
    if (typeof val !== "string" || val.trim().length === 0) {
      return { valid: false, error: `Field "${field}" is required.` };
    }
    if (val.trim().length > 200) {
      return {
        valid: false,
        error: `Field "${field}" must be 200 characters or fewer.`,
      };
    }
    // Profanity check (bad-words library)
    if (filter.isProfane(val)) {
      return {
        valid: false,
        error:
          "One or more fields contain inappropriate language. Please keep it classy — the Grand Praiser has standards.",
      };
    }
  }

  return {
    valid: true,
    data: {
      name: (b.name as string).trim(),
      jobTitle: (b.jobTitle as string).trim(),
      location: (b.location as string).trim(),
      favoriteMeal: (b.favoriteMeal as string).trim(),
      uniqueThing: (b.uniqueThing as string).trim(),
    },
  };
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Build response object early so we can attach cookies
  const response = NextResponse.json({}, { status: 200 });

  // 1. Session
  const { sessionId } = getOrCreateSessionId(request, response);

  // 2. Parse body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body.", retryable: false },
      { status: 400 }
    );
  }

  // 3. Validate + profanity check
  const validation = validateBody(rawBody);
  if (!validation.valid || !validation.data) {
    return NextResponse.json(
      { error: validation.error, retryable: false },
      { status: 400 }
    );
  }
  const input = validation.data;

  // 4. Rate limit
  const allowed = await checkRateLimit(sessionId);
  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "You've reached your praise limit for this hour. The Grand Praiser needs a moment to recover from the intensity of your magnificence. Please try again later.",
        retryable: false,
        rateLimited: true,
      },
      { status: 429 }
    );
  }

  // 5. Log form_submitted analytics (fire-and-forget)
  void logEvent(sessionId, "form_submitted", { name: input.name });

  // 6. Call Gemini
  let geminiCompliments: GeminiCompliment[] = [];
  try {
    const userTurn = buildGenerationUserTurn(input);
    const result = await getModel(userTurn);

    const rawText = result.output_text;
    console.log(result);
    const parsed = JSON.parse(rawText!);

    if (!Array.isArray(parsed)) throw new Error("Response is not an array");

    // Filter for valid items with known angles
    const validAngles: ComplimentAngle[] = ["mythic", "scientific", "hype-friend"];
    geminiCompliments = parsed.filter(
      (item): item is GeminiCompliment =>
        item &&
        typeof item.text === "string" &&
        item.text.length > 0 &&
        validAngles.includes(item.angle)
    );
  } catch (err) {
    console.error("[generate] Gemini call failed:", err);
    void logEvent(sessionId, "generation_error", {
      error: String(err),
    });
    return NextResponse.json(
      {
        error:
          "We couldn't reach the compliment engine — mind trying again?",
        retryable: true,
      },
      { status: 500 }
    );
  }

  // 7. Check result completeness
  if (geminiCompliments.length === 0) {
    void logEvent(sessionId, "generation_error", { reason: "empty_response" });
    return NextResponse.json(
      {
        error: "The compliment engine returned an empty response. Please try again.",
        retryable: true,
      },
      { status: 500 }
    );
  }

  const status =
    geminiCompliments.length === 3 ? "complete" : "partial";

  // 8. Build and save the compliment set
  const compliments = geminiCompliments.map((c) => ({
    complimentId: uuidv4(),
    angle: c.angle,
    thread: [{ level: 0, text: c.text, createdAt: new Date() }],
    copyCount: 0,
  }));

  let setId: string;
  try {
    setId = await createComplimentSet({
      sessionId,
      input,
      compliments,
      status,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("[generate] MongoDB write failed:", err);
    return NextResponse.json(
      {
        error: "Failed to save your compliments. Please try again.",
        retryable: true,
      },
      { status: 500 }
    );
  }

  // 9. Log success analytics (fire-and-forget)
  void logEvent(sessionId, "generation_success", { setId, status });

  // 10. Return the set
  const res = NextResponse.json(
    { setId, compliments, status },
    { status: 200 }
  );

  // Copy session cookie onto the real response
  const sessionCookie = response.cookies.get("sessionId");
  if (sessionCookie) {
    res.cookies.set("sessionId", sessionCookie.value, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
  }

  return res;
}
