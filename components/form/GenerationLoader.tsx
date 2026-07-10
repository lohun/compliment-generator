"use client";

import React, { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "@/lib/gemini/prompts";

interface GenerationLoaderProps {
  isComplete: boolean;
}

export default function GenerationLoader({ isComplete }: GenerationLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Simulate progress: 0→90% over ~2.5s, then hold at 90 until complete
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const targetDuration = 2500; // 2.5 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = (elapsed / targetDuration) * 90;
      setProgress(Math.min(rawProgress, 90));
    }, 50);

    return () => clearInterval(interval);
  }, [isComplete]);

  // Rotate messages every 1.2s
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full rounded-lg p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-96"
      style={{
        background: "linear-gradient(135deg, #6d1214 0%, #2e4052 100%)",
      }}
    >
      {/* Progress label */}
      <div
        className="text-5xl md:text-6xl font-black mb-6 tracking-tight"
        style={{ fontFamily: "var(--font-playfair-display)", color: "#a66f43" }}
      >
        LOADING {Math.round(progress)}%
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-1 bg-surface/20 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${progress}%`, background: "linear-gradient(to right, #a66f43, #c48a60)" }}
        />
      </div>

      {/* Rotating message */}
      <div
        key={messageIndex}
        className="text-cream-50 text-lg italic animate-fade-in-out mb-6 min-h-6 max-w-md"
      >
        {LOADING_MESSAGES[messageIndex]}
      </div>

      {/* Skeleton outlines of cards */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 opacity-30 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-cream-50/30 p-6 space-y-4 animate-pulse"
          >
            <div className="h-6 bg-cream-50/20 rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-4 bg-cream-50/20 rounded w-full" />
              <div className="h-4 bg-cream-50/20 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-fade-in-out {
          animation: fadeInOut 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
