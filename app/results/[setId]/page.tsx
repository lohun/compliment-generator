import React from "react";
import { getComplimentSet, ComplimentSet } from "@/lib/db/complimentSets";
import { notFound } from "next/navigation";
import ResultsClient from "./ResultsClient";

interface ResultsPageProps {
  params: Promise<{ setId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { setId } = await params;

  let complimentSet: ComplimentSet | null = null;
  let fetchError: unknown = null;

  try {
    complimentSet = await getComplimentSet(setId);
  } catch (err) {
    fetchError = err;
    console.error("[results page] Error fetching set:", err);
  }

  if (!complimentSet) {
    if (fetchError) {
      throw fetchError;
    }
    notFound();
  }

  return <ResultsClient initialSet={complimentSet} setId={setId} />;
}
