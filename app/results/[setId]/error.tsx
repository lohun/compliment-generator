"use client";

import TransitionLink from "@/components/transitions/TransitionLink";

interface ResultsErrorProps {
  error: Error;
  reset: () => void;
}

export default function ResultsError({ error, reset }: ResultsErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-5 py-12 text-on-surface">
      <div className="w-full max-w-4xl rounded-[32px] border border-outline-variant/20 bg-surface-container-low p-10 shadow-[0_30px_90px_rgba(43,17,20,0.12)]">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-primary/80 mb-4">
            Result Load Failed
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-primary" style={{ fontFamily: "var(--font-playfair-display)" }}>
            The praise is stuck in rehearsal.
          </h1>
          <p className="mt-4 text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            We couldn't load your compliment set. Try again, or return to the form and start anew.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={reset}
            className="px-5 py-3 rounded-lg bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors duration-200"
          >
            Retry
          </button>
          <TransitionLink
            href="/form"
            className="px-5 py-3 rounded-lg border border-primary text-primary font-bold text-sm text-center hover:bg-primary/5 transition-colors duration-200"
          >
            Start Over
          </TransitionLink>
          <TransitionLink
            href="/history"
            className="px-5 py-3 rounded-lg border border-outline text-on-surface font-bold text-sm text-center hover:bg-surface/70 transition-colors duration-200"
          >
            View History
          </TransitionLink>
        </div>

        <div className="mt-8 rounded-3xl border border-outline-variant/30 bg-surface p-5 text-sm text-on-surface-variant">
          <p className="font-semibold text-on-surface">Error details</p>
          <p className="mt-2 break-words">{error?.message ?? "Unknown error."}</p>
        </div>
      </div>
    </div>
  );
}
