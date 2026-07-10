"use client";

import React, { useState } from "react";
import { Compliment, ComplimentAngle } from "@/lib/db/complimentSets";
import EscalationHistory from "@/components/form/EscalationHistory";

interface ComplimentCardProps {
  compliment: Compliment;
  setId: string;
  onEscalate: (complimentId: string) => Promise<void>;
  escalating: boolean;
}

const angleLabels: Record<ComplimentAngle, string> = {
  mythic: "Mythic",
  scientific: "Scientific",
  "hype-friend": "Hype-Friend",
};

const angleColors: Record<ComplimentAngle, string> = {
  mythic: "text-burgundy-700",
  scientific: "text-blue-600",
  "hype-friend": "text-amber-600",
};

export default function ComplimentCard({
  compliment,
  setId,
  onEscalate,
  escalating,
}: ComplimentCardProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const currentLevel = compliment.thread[compliment.thread.length - 1];

  const handleCopy = async () => {
    const textToCopy = currentLevel.text;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      setCopyError("Copy failed — text is selected, press ⌘/Ctrl+C.");
      console.error("Clipboard error:", err);
      // Fallback: create a hidden input and select it
      const input = document.createElement("textarea");
      input.value = textToCopy;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setCopyError(null);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // Already set copyError above
      } finally {
        document.body.removeChild(input);
      }
    }
  };

  const handleEscalate = async () => {
    try {
      await onEscalate(compliment.complimentId);
    } catch (err) {
      console.error("Escalation failed:", err);
    }
  };

  return (
    <div
      className="rounded-lg border border-outline-variant/30 p-6 md:p-8 overflow-hidden relative"
      style={{
        backgroundColor: "#fdf9f6",
        boxShadow: "0 4px 12px rgba(109, 18, 20, 0.08)",
      }}
    >
      {/* Angle badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${angleColors[compliment.angle]}`}
          style={{
            backgroundColor: "rgba(201, 162, 39, 0.1)",
          }}
        >
          {angleLabels[compliment.angle]}
        </span>
        {compliment.thread.length > 1 && (
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">
            Level {compliment.thread.length - 1}
          </span>
        )}
      </div>

      {/* Compliment text */}
      <div
        className="mb-6 leading-relaxed text-lg text-on-surface"
        style={{ fontFamily: "var(--font-playfair-display)" }}
      >
        {currentLevel.text}
      </div>

      {/* Copy error */}
      {copyError && (
        <div className="mb-4 text-xs text-error bg-error-container/20 px-3 py-2 rounded">
          {copyError}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleEscalate}
          disabled={escalating}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
          style={{
            backgroundColor: escalating ? "rgba(166, 111, 67, 0.7)" : "#a66f43",
          }}
        >
          {escalating ? (
            <>
              <span className="animate-spin inline-block w-4 h-4">⟳</span>
              Escalating…
            </>
          ) : compliment.thread.length > 1 ? (
            <>
              <span>Escalate Again</span>
              <span>🔥</span>
            </>
          ) : (
            <>
              <span>Escalate</span>
              <span>🚀</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          disabled={escalating}
          className="flex items-center gap-2 px-4 py-2 border border-primary bg-transparent text-primary font-bold rounded-lg hover:bg-primary/5 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
        >
          {copied ? (
            <>
              <span>✓</span>
              Copied!
            </>
          ) : (
            <>
              <span>📋</span>
              Copy
            </>
          )}
        </button>
      </div>

      {/* History toggle */}
      {compliment.thread.length > 1 && (
        <div className="pt-4 border-t border-outline-variant/30">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm font-semibold text-primary hover:text-primary-container transition-colors duration-200"
          >
            {showHistory ? "Hide History" : "Show History"} ({compliment.thread.length} levels)
          </button>
          {showHistory && (
            <EscalationHistory thread={compliment.thread} />
          )}
        </div>
      )}
    </div>
  );
}
