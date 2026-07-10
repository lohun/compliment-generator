"use client";

import React, { useState, useEffect } from "react";
import { usePageReadiness } from "@/components/transitions/usePageReadiness";
import TransitionLink from "@/components/transitions/TransitionLink";
import { ComplimentSet } from "@/lib/db/complimentSets";
import { useTransition } from "@/components/transitions/TransitionContext";

export default function HistoryPage() {
  usePageReadiness();
  const { startTransition } = useTransition();

  const [sets, setSets] = useState<ComplimentSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch history");
        }
        setSets(data.sets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
              className="text-primary font-bold border-b-2 border-primary pb-1"
            >
              History
            </TransitionLink>
            <TransitionLink
              href="/form"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300"
            >
              Compliment Me
            </TransitionLink>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center py-12 px-5 relative">
        {/* Hero title */}
        <div className="text-center mb-10 max-w-2xl">
          <h1
            className="text-5xl md:text-6xl text-primary font-black tracking-tight mb-3 leading-tight"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            Your Accolades
          </h1>
          <p className="text-lg text-on-surface-variant italic">
            Relive your past moments of artificial glory.
          </p>
        </div>

        {/* Loading or Error state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">
              Retrieving your praise history…
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="w-full max-w-2xl rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-sm mb-8"
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && sets.length === 0 && !error && (
          <div className="text-center py-12 max-w-2xl">
            <p className="text-on-surface-variant text-lg mb-6">
              You haven't generated any compliments yet.
            </p>
            <TransitionLink
              href="/form"
              className="inline-block px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container transition-all duration-200"
            >
              Generate Your First Praise
            </TransitionLink>
          </div>
        )}

        {/* History grid */}
        {!loading && sets.length > 0 && (
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sets.map((set) => (
                <div
                  key={set._id?.toString()}
                  className="rounded-lg border border-outline-variant/30 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  style={{ backgroundColor: "#FAF6F3" }}
                  onClick={() => {
                    const setId = set._id?.toString();
                    if (setId) {
                      startTransition(`/results/${setId}`);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <p className="font-bold text-on-surface">
                      {set.input.name}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {set.input.jobTitle}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {set.compliments.length} compliments •{" "}
                      {set.input.location}
                    </p>
                    <p className="text-xs text-on-surface-variant/60">
                      {new Date(set.createdAt).toLocaleDateString()} at{" "}
                      {new Date(set.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {set.status !== "complete" && (
                      <p className="text-xs font-semibold text-warning">
                        Status: {set.status}
                      </p>
                    )}
                  </div>
                </div>
              ))}
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
