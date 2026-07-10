"use client";

import React, { useState } from "react";
import { ThreadEntry } from "@/lib/db/complimentSets";

interface EscalationHistoryProps {
  thread: ThreadEntry[];
}

export default function EscalationHistory({ thread }: EscalationHistoryProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyVersion = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {thread.map((entry, idx) => (
        <div
          key={idx}
          className="p-4 bg-on-surface/5 rounded-lg text-sm leading-relaxed"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
              Level {entry.level}
            </span>
            <button
              onClick={() => handleCopyVersion(entry.text, idx)}
              className="text-xs font-semibold text-primary hover:text-primary-container transition-colors duration-200 whitespace-nowrap"
            >
              {copiedIndex === idx ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-on-surface">{entry.text}</p>
        </div>
      ))}
    </div>
  );
}
