"use client";

import TransitionLink from "@/components/transitions/TransitionLink";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-5 py-12 text-on-surface">
      <div className="w-full max-w-3xl rounded-[32px] border border-outline-variant/20 bg-surface-container-low p-10 shadow-[0_30px_90px_rgba(43,17,20,0.12)]">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-primary/80 mb-4">
            Curtain Error
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-primary" style={{ fontFamily: "var(--font-playfair-display)" }}>
            Something broke behind the scenes.
          </h1>
          <p className="mt-4 text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            The Grand Praiser is having a moment. You can try again, or return to the stage and start fresh.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={reset}
            className="px-5 py-3 rounded-lg bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors duration-200"
          >
            Try Again
          </button>
          <TransitionLink
            href="/"
            className="px-5 py-3 rounded-lg border border-primary text-primary font-bold text-sm text-center hover:bg-primary/5 transition-colors duration-200"
          >
            Go Home
          </TransitionLink>
          <TransitionLink
            href="/form"
            className="px-5 py-3 rounded-lg border border-outline text-on-surface font-bold text-sm text-center hover:bg-surface/70 transition-colors duration-200"
          >
            Start A New Compliment
          </TransitionLink>
        </div>

        <div className="mt-8 rounded-3xl border border-outline-variant/30 bg-surface p-5 text-sm text-on-surface-variant">
          <p className="font-semibold text-on-surface">Technical note</p>
          <p className="mt-2 break-words">{error?.message ?? "Unknown error."}</p>
        </div>
      </div>
    </div>
  );
}
