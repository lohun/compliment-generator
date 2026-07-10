import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini/client";
import { buildEscalationContents, RESPONSE_SCHEMA } from "@/lib/gemini/prompts";
import { getComplimentSet, appendEscalation } from "@/lib/db/complimentSets";
import { logEvent } from "@/lib/db/analytics";
import { getSessionId } from "@/lib/session";
import type { ThreadEntry } from "@/lib/db/complimentSets";

interface EscalateRequestBody {
    complimentId: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ setId: string }> }
) {
    const { setId } = await params;
    const sessionId = getSessionId(request);

    if (!sessionId) {
        return NextResponse.json(
            { error: "Session not found.", retryable: false },
            { status: 400 }
        );
    }

    if (!setId) {
        return NextResponse.json(
            { error: "Set ID is required.", retryable: false },
            { status: 400 }
        );
    }

    // Parse body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body.", retryable: false },
            { status: 400 }
        );
    }

    const { complimentId } = body as EscalateRequestBody;

    if (!complimentId) {
        return NextResponse.json(
            { error: "Compliment ID is required.", retryable: false },
            { status: 400 }
        );
    }

    // Fetch the set
    let set;
    try {
        set = await getComplimentSet(setId);
    } catch (err) {
        console.error("[escalate] Failed to fetch set:", err);
        return NextResponse.json(
            { error: "Failed to load compliment set.", retryable: true },
            { status: 500 }
        );
    }

    if (!set) {
        return NextResponse.json(
            { error: "Compliment set not found.", retryable: false },
            { status: 404 }
        );
    }

    // Find the compliment
    const compliment = set.compliments.find(
        (c) => c.complimentId === complimentId
    );

    if (!compliment) {
        return NextResponse.json(
            { error: "Compliment not found in set.", retryable: false },
            { status: 404 }
        );
    }

    const currentLevel = compliment.thread.length;

    // Call Gemini
    let escalatedText: string;
    try {
        const contents = buildEscalationContents(
            set.input,
            compliment.thread,
            currentLevel
        );
        const result = await getModel(JSON.stringify(contents));

        const rawText = result.output_text;
        const parsed = JSON.parse(rawText!);

        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error("Invalid response format from Gemini");
        }

        // Use the first (and should be only) item
        escalatedText = parsed[0].text;
        if (typeof escalatedText !== "string" || escalatedText.length === 0) {
            throw new Error("Empty escalation text");
        }
    } catch (err) {
        console.error("[escalate] Gemini call failed:", err);
        void logEvent(sessionId, "escalate_error", {
            setId,
            complimentId,
            error: String(err),
        });
        return NextResponse.json(
            { error: "Failed to escalate this compliment. Mind trying again?", retryable: true },
            { status: 500 }
        );
    }

    // Append to the thread
    const newEntry: ThreadEntry = {
        level: currentLevel,
        text: escalatedText,
        createdAt: new Date(),
    };

    try {
        const success = await appendEscalation(setId, complimentId, newEntry);
        if (!success) {
            throw new Error("appendEscalation returned false");
        }
    } catch (err) {
        console.error("[escalate] MongoDB update failed:", err);
        return NextResponse.json(
            { error: "Failed to save escalation. Try again?", retryable: true },
            { status: 500 }
        );
    }

    // Log success
    void logEvent(sessionId, "escalate_success", {
        setId,
        complimentId,
        level: currentLevel,
    });

    return NextResponse.json(
        { complimentId, newEntry },
        { status: 200 }
    );
}
