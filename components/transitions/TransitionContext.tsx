"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface TransitionContextType {
  isTransitioning: boolean;
  setIsTransitioning: (v: boolean) => void;
  progress: number;
  setProgress: (v: number) => void;
  pageReady: boolean;
  setPageReady: (ready: boolean) => void;
  isBooted: boolean;
  setIsBooted: (booted: boolean) => void;
  startTransition: (href: string) => void;
  /** Refs are stored directly — TransitionLayer calls these setters once on mount */
  registerOpenFn: (fn: () => void) => void;
  registerCloseFn: (fn: (callback: () => void) => void) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(
  undefined
);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Start transitioning=true so the boot curtain shows immediately
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isBooted, setIsBooted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageReady, setPageReady] = useState(false);

  // Plain refs — never cause re-renders, never go stale across closures
  const openFnRef = useRef<(() => void) | null>(null);
  const closeFnRef = useRef<((cb: () => void) => void) | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const registerOpenFn = useCallback((fn: () => void) => {
    openFnRef.current = fn;
  }, []);

  const registerCloseFn = useCallback((fn: (cb: () => void) => void) => {
    closeFnRef.current = fn;
  }, []);

  // ─── startTransition (link clicks) ─────────────────────────────────────────
  const startTransition = useCallback(
    (href: string) => {
      if (isTransitioning) return;

      setIsTransitioning(true);
      setPageReady(false);
      setProgress(0);
      clearTimer();

      const doClose = closeFnRef.current;
      if (doClose) {
        doClose(() => {
          router.push(href);
        });
      } else {
        router.push(href);
      }

      // Crawl progress 0 → 50 during curtain-close (≈1.2 s)
      let p = 0;
      const step = 50 / 60;
      progressTimerRef.current = setInterval(() => {
        p += step;
        if (p >= 50) { p = 50; clearTimer(); }
        setProgress(Math.floor(p));
      }, 20);
    },
    [isTransitioning, clearTimer, router]
  );

  // ─── On pathname change: crawl 50 → 90 while waiting for page ──────────────
  useEffect(() => {
    if (isTransitioning && isBooted) {
      clearTimer();
      setProgress(50);
      let p = 50;
      progressTimerRef.current = setInterval(() => {
        p += 1;
        if (p >= 90) { p = 90; clearTimer(); }
        setProgress(p);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ─── On pageReady: sprint to 100, then trigger open animation ──────────────
  useEffect(() => {
    if (!pageReady || !isTransitioning) return;

    clearTimer();

    // Sprint from current progress to 100 in ~300 ms
    let p = 0;
    // Read the live value via a getter so we don't capture a stale closure
    setProgress((prev) => { p = prev; return prev; });

    const increment = (100 - p) / (300 / 20);

    progressTimerRef.current = setInterval(() => {
      p += increment;
      if (p >= 100) {
        p = 100;
        clearTimer();
        setProgress(100);
        // Fire the open animation — registered by TransitionLayer in useLayoutEffect
        openFnRef.current?.();
        return;
      }
      setProgress(Math.floor(p));
    }, 20);
  // Only re-run when pageReady flips to true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageReady]);

  return (
    <TransitionContext.Provider
      value={{
        isTransitioning,
        setIsTransitioning,
        progress,
        setProgress,
        pageReady,
        setPageReady,
        isBooted,
        setIsBooted,
        startTransition,
        registerOpenFn,
        registerCloseFn,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used within TransitionProvider");
  return ctx;
}
