import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComplimentInput {
  name: string;
  jobTitle: string;
  location: string;
  favoriteMeal: string;
  uniqueThing: string;
}

export type ComplimentAngle = "mythic" | "scientific" | "hype-friend";

export interface ThreadEntry {
  level: number;
  text: string;
  createdAt: Date;
}

export interface Compliment {
  complimentId: string;
  angle: ComplimentAngle;
  thread: ThreadEntry[];
  copyCount: number;
}

export interface ComplimentSet {
  _id?: ObjectId;
  sessionId: string;
  input: ComplimentInput;
  compliments: Compliment[];
  status: "complete" | "partial" | "failed";
  createdAt: Date;
}

// ─── Data access ──────────────────────────────────────────────────────────────

const COLLECTION = "complimentSets";

export async function createComplimentSet(
  data: Omit<ComplimentSet, "_id">
): Promise<string> {
  const db = await getDb();
  const result = await db.collection<ComplimentSet>(COLLECTION).insertOne({
    ...data,
    _id: new ObjectId(),
  });
  return result.insertedId.toHexString();
}

export async function getComplimentSet(
  setId: string
): Promise<ComplimentSet | null> {
  if (!ObjectId.isValid(setId)) return null;
  const db = await getDb();
  return db
    .collection<ComplimentSet>(COLLECTION)
    .findOne({ _id: new ObjectId(setId) });
}

export async function getSessionHistory(
  sessionId: string,
  limit = 20
): Promise<ComplimentSet[]> {
  const db = await getDb();
  return db
    .collection<ComplimentSet>(COLLECTION)
    .find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

// ─── Escalation ───────────────────────────────────────────────────────────────

export async function appendEscalation(
  setId: string,
  complimentId: string,
  newEntry: ThreadEntry
): Promise<boolean> {
  if (!ObjectId.isValid(setId)) return false;
  const db = await getDb();
  const result = await db.collection<ComplimentSet>(COLLECTION).updateOne(
    { _id: new ObjectId(setId), "compliments.complimentId": complimentId },
    {
      $push: { "compliments.$.thread": newEntry } as never,
    }
  );
  return result.modifiedCount > 0;
}
