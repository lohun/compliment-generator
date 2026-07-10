import { NextResponse } from "next/server";
import { getComplimentSet } from "@/lib/db/complimentSets";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;

  if (!setId) {
    return NextResponse.json(
      { error: "Set ID is required." },
      { status: 400 }
    );
  }

  try {
    const set = await getComplimentSet(setId);

    if (!set) {
      return NextResponse.json(
        { error: "Compliment set not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(set, { status: 200 });
  } catch (err) {
    console.error("[GET /compliments/[setId]]", err);
    return NextResponse.json(
      { error: "Failed to fetch compliment set." },
      { status: 500 }
    );
  }
}
