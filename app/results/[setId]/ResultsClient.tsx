"use client";

import React, { useState, useCallback } from "react";
import { usePageReadiness } from "@/components/transitions/usePageReadiness";
import { useTransition } from "@/components/transitions/TransitionContext";
import TransitionLink from "@/components/transitions/TransitionLink";
import ComplimentCard from "@/components/form/ComplimentCard";
import GenerationLoader from "@/components/form/GenerationLoader";
import { ComplimentSet, ThreadEntry } from "@/lib/db/complimentSets";

interface ResultsClientProps {
  initialSet: ComplimentSet;
  setId: string;
}

export default function ResultsClient({
  initialSet,
  setId,
}: ResultsClientProps) {
  usePageReadiness();
  const { startTransition } = useTransition();

  const [set, setSet] = useState<ComplimentSet>(initialSet);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [escalationError, setEscalationError] = useState<string | null>(null);

  // While the set was being generated, its status might still be "partial"
  // Check periodically if it's been updated (in case we navigated away and back mid-generation)
  React.useEffect(() => {
    if (set.status === "complete" || set.status === "partial") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/compliments/${setId}`);
        if (!res.ok) return;
        const updated = await res.json();
        setSet(updated);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [set.status, setId]);

  const handleEscalate = useCallback(
    async (complimentId: string) => {
      setEscalatingId(complimentId);
      setEscalationError(null);

      try {
        const res = await fetch(`/api/compliments/${setId}/escalate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ complimentId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to escalate");
        }

        // Update the local set with the new thread entry
        const newEntry: ThreadEntry = data.newEntry;
        setSet((prevSet) => ({
          ...prevSet,
          compliments: prevSet.compliments.map((c) =>
            c.complimentId === complimentId
              ? { ...c, thread: [...c.thread, newEntry] }
              : c
          ),
        }));
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Escalation failed";
        setEscalationError(errorMsg);
        console.error("Escalation error:", err);
      } finally {
        setEscalatingId(null);
      }
    },
    [setId]
  );

  const handleRegenerateAll = () => {
    // Navigate back to form with the same input pre-filled
    // For now, just go back to the form
    startTransition("/form");
  };

  const isGenerating = set.status !== "complete" && set.status !== "partial";

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant/10">
        <div className="flex justify-between items-center w-full px-5 py-2 max-w-[1200px] mx-auto">
          <TransitionLink
            href="/"
            className="font-display text-3xl text-primary tracking-tighter hover:opacity-90 transition-opacity"
          >
            The Grand Praiser
          </TransitionLink>
          <nav className="hidden md:flex items-center gap-6">
            <TransitionLink
              href="/history"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300"
            >
              History
            </TransitionLink>
            <TransitionLink
              href="/form"
              className="text-primary font-bold border-b-2 border-primary pb-1"
            >
              Compliment Me
            </TransitionLink>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-5 relative">
        {/* Hero title */}
        <div className="text-center mb-10 max-w-2xl">
          <h1
            className="text-5xl md:text-6xl text-primary font-black tracking-tight mb-3 leading-tight"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            Your Praise Awaits
          </h1>
          {isGenerating && (
            <p className="text-lg text-on-surface-variant italic">
              The Grand Praiser is composing your magnificence…
            </p>
          )}
        </div>

        {/* Loading state */}
        {isGenerating && <GenerationLoader isComplete={false} />}

        {/* Results grid */}
        {!isGenerating && (
          <div className="w-full max-w-4xl space-y-8">
            {/* Compliment cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {set.compliments.map((compliment) => (
                <ComplimentCard
                  key={compliment.complimentId}
                  compliment={compliment}
                  setId={setId}
                  onEscalate={handleEscalate}
                  escalating={escalatingId === compliment.complimentId}
                />
              ))}
            </div>

            {/* Error banner */}
            {escalationError && (
              <div
                role="alert"
                className="rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-sm"
              >
                {escalationError}
              </div>
            )}

            {/* Status notice */}
            {set.status === "partial" && (
              <div
                role="alert"
                className="rounded-lg border border-warning/30 bg-warning-container text-on-warning-container px-4 py-3 text-sm"
              >
                We generated {set.compliments.length} of 3 compliments. Try
                regenerating for the missing one!
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleRegenerateAll}
                className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container transition-all duration-200"
              >
                Regenerate All
              </button>
              <TransitionLink
                href="/form"
                className="px-6 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-all duration-200"
              >
                Start Over
              </TransitionLink>
              <TransitionLink
                href="/history"
                className="px-6 py-3 border border-outline text-on-surface font-bold rounded-lg hover:bg-outline/5 transition-all duration-200"
              >
                View History
              </TransitionLink>
            </div>

            {/* Input summary */}
            <div
              className="rounded-lg border border-outline-variant/30 p-6 bg-surface-container text-center"
              style={{ backgroundColor: "rgba(232, 196, 196, 0.1)" }}
            >
              <p className="text-sm text-on-surface-variant mb-3 font-semibold">
                You entered:
              </p>
              <div className="text-sm text-on-surface space-y-1 font-mono">
                <p>
                  <span className="font-bold">Name:</span> {set.input.name}
                </p>
                <p>
                  <span className="font-bold">Job:</span> {set.input.jobTitle}
                </p>
                <p>
                  <span className="font-bold">Location:</span>{" "}
                  {set.input.location}
                </p>
                <p>
                  <span className="font-bold">Meal:</span>{" "}
                  {set.input.favoriteMeal}
                </p>
                <p>
                  <span className="font-bold">Unique thing:</span>{" "}
                  {set.input.uniqueThing}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/20 mt-auto">
        <div className="w-full py-6 px-5 flex flex-col items-center gap-2 max-w-[1200px] mx-auto">
          <div
            className="text-primary text-3xl tracking-tighter mb-2 select-none"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            The Grand Praiser
          </div>
          <div className="flex gap-6 mb-2">
            {["Privacy", "Terms", "Support"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[13px] font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-wide"
              >
                {link}
              </a>
            ))}
          </div>
          <p className="text-[13px] text-on-surface-variant">
            © 2026 The Grand Praiser. Crafted for the Dramatically Inclined.
          </p>
        </div>
      </footer>
    </div>
  );
}
