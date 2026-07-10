import { getDb } from "./mongodb";

export type AnalyticsEventName =
  | "form_submitted"
  | "generation_success"
  | "generation_error"
  | "escalate_clicked"
  | "escalate_success"
  | "escalate_error"
  | "copy_clicked"
  | "history_viewed"
  | "nav_transition";

interface AnalyticsEvent {
  sessionId: string;
  event: AnalyticsEventName;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Fire-and-forget analytics write.
 * Never throws — callers use `void logEvent(...)` and never await the result.
 */
export async function logEvent(
  sessionId: string,
  event: AnalyticsEventName,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const db = await getDb();
    await db.collection<AnalyticsEvent>("analyticsEvents").insertOne({
      sessionId,
      event,
      metadata,
      timestamp: new Date(),
    });
  } catch (err) {
    // Non-blocking: log to console but never surface to the user
    console.error("[analytics] Failed to log event:", event, err);
  }
}
