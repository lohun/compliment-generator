"use client";

import React, { useState } from "react";
import { usePageReadiness } from "@/components/transitions/usePageReadiness";
import { useTransition } from "@/components/transitions/TransitionContext";
import TransitionLink from "@/components/transitions/TransitionLink";
import ComplimentForm, { FormFields } from "@/components/form/ComplimentForm";

export default function FormPage() {
  // This page needs no async data — signal ready immediately
  usePageReadiness();

  const { startTransition } = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (fields: FormFields) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/compliments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(
          data.error ?? "Something went wrong. Please try again."
        );
        setSubmitting(false);
        return;
      }

      // Trigger the curtain close → navigate to results
      startTransition(`/results/${data.setId}`);
      // Leave submitting=true — curtain takes over from here
    } catch {
      setServerError(
        "We couldn't reach the compliment engine — check your connection and try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface overflow-x-hidden">
      {/* Subtle curtain-wave backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.04]"
        style={{
          background:
            "linear-gradient(90deg, #6d1214 0%, #8b3a3d 50%, #6d1214 100%)",
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,1) 100%)",
          animation: "curtainWave 15s ease-in-out infinite",
        }}
      />

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
        {/* Hero copy */}
        <div className="text-center mb-10 max-w-2xl">
          <h1
            className="text-5xl md:text-6xl text-primary font-black tracking-tight mb-3 leading-tight"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            Seek Your Ovation
          </h1>
          <p className="text-lg text-on-surface-variant italic">
            Supply the details of your existence, and prepare for a standing ovation from the digital ether.
          </p>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-2xl rounded-xl relative overflow-hidden border border-outline-variant/30"
          style={{
            backgroundColor: "#e8d4cc", // blush-200
            boxShadow: "0 10px 40px -15px rgba(109, 18, 20, 0.15)",
          }}
        >
          {/* Accent border at top */}
          <div
            className="absolute top-0 left-0 w-full h-[3px]"
            style={{
              background:
                "linear-gradient(to right, #6d1214, #a66f43, #6d1214)",
              opacity: 0.6,
            }}
          />

          <div className="p-8 md:p-10">
            <ComplimentForm
              onSubmit={handleSubmit}
              submitting={submitting}
              serverError={serverError}
            />
          </div>
        </div>

        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-[100%] pointer-events-none"
          style={{
            background: "rgba(109, 18, 20, 0.05)",
            filter: "blur(100px)",
          }}
        />
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

      <style>{`
        @keyframes curtainWave {
          0%, 100% { transform: scaleX(1.05); }
          50% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
