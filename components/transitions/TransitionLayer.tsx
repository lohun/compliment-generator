"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTransition } from "./TransitionContext";
import gsap from "gsap";

export default function TransitionLayer() {
  const {
    progress,
    setPageReady,
    isBooted,
    setIsBooted,
    setIsTransitioning,
    registerOpenFn,
    registerCloseFn,
  } = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // ─── Detect prefers-reduced-motion ─────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ─── Set curtain start positions via GSAP (not conflicting CSS) ────────────
  // Must run before paint so curtains are never seen in "open" state on boot
  useLayoutEffect(() => {
    if (leftRef.current) gsap.set(leftRef.current, { xPercent: 0 });
    if (rightRef.current) gsap.set(rightRef.current, { xPercent: 0 });
    if (loaderRef.current) gsap.set(loaderRef.current, { opacity: 1 });
  }, []);

  // ─── Register animation callbacks SYNCHRONOUSLY before any effects fire ────
  // useLayoutEffect runs before useEffect, so openFnRef/closeFnRef are set
  // before TransitionContext's useEffect(pageReady) tries to call openFn.
  useLayoutEffect(() => {
    // --- OPEN: split curtains apart ---
    registerOpenFn(() => {
      if (reducedMotion) {
        gsap.to(containerRef.current, {
          opacity: 0, duration: 0.4, ease: "power2.inOut",
          onComplete: () => {
            setVisible(false);
            setIsTransitioning(false);
          },
        });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false);
          setIsTransitioning(false);  // Bug #4 fix: reset so next link click works
        },
      });

      tl.to(loaderRef.current, { opacity: 0, duration: 0.3 })
        .to(leftRef.current,  { xPercent: -100, duration: 1.5, ease: "power4.inOut" }, "-=0.1")
        .to(rightRef.current, { xPercent: 100,  duration: 1.5, ease: "power4.inOut" }, "<");
    });

    // --- CLOSE: slide curtains in from edges ---
    registerCloseFn((onClosed: () => void) => {
      setVisible(true);

      if (reducedMotion) {
        gsap.to(containerRef.current, {
          opacity: 1, duration: 0.3, ease: "power2.out", onComplete: onClosed,
        });
        return;
      }

      // Reset curtains to fully open before animating them closed
      gsap.set(leftRef.current,  { xPercent: -100 });
      gsap.set(rightRef.current, { xPercent:  100 });
      gsap.set(loaderRef.current, { opacity: 0 });

      gsap.timeline({ onComplete: onClosed })
        .to([leftRef.current, rightRef.current], {
          xPercent: 0, duration: 1.2, ease: "power4.inOut",
        })
        .to(loaderRef.current, { opacity: 1, duration: 0.3 }, "-=0.3");
    });
  // Re-register when reducedMotion preference changes
  }, [reducedMotion, registerOpenFn, registerCloseFn, setIsTransitioning]);

  // ─── Boot readiness check ───────────────────────────────────────────────────
  useEffect(() => {
    if (isBooted) return;

    const check = async () => {
      const minDelay = new Promise<void>((r) => setTimeout(r, 800));
      const fonts = document.fonts?.ready ?? Promise.resolve();

      const images = Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((r) => { img.onload = img.onerror = () => r(); })
      );

      await Promise.allSettled([minDelay, fonts, ...images]);

      setIsBooted(true);
      setPageReady(true);    // triggers the sprint-to-100% in TransitionContext
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(check);
    } else {
      setTimeout(check, 50);
    }
  }, [isBooted, setIsBooted, setPageReady]);

  // Don't unmount until the open animation has fully finished
  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none pointer-events-none"
    >
      {/* Left curtain panel */}
      <div
        ref={leftRef}
        className="absolute inset-y-0 left-0 w-1/2 z-10"
        style={{ backgroundColor: "#2e4052" }}   /* wine-950 */
      />

      {/* Right curtain panel */}
      <div
        ref={rightRef}
        className="absolute inset-y-0 right-0 w-1/2 z-10"
        style={{ backgroundColor: "#6d1214" }}   /* wine-800 */
      />

      {/* Loading counter */}
      <div ref={loaderRef} className="relative z-20 text-center px-6 pointer-events-none">
        <p
          className="font-display italic tracking-widest uppercase mb-4 text-4xl md:text-6xl"
          style={{ color: "#fdf9f6" }}           /* cream-50 */
        >
          LOADING {progress}%
        </p>
        <div
          className="w-48 h-[3px] mx-auto rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(253,249,246,0.2)" }}
        >
          <div
            className="h-full transition-none rounded-full"
            style={{ width: `${progress}%`, backgroundColor: "#a66f43" }}  /* gold-500 */
          />
        </div>
      </div>
    </div>
  );
}
