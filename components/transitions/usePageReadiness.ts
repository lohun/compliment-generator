"use client";

import { useEffect } from "react";
import { useTransition } from "./TransitionContext";

/**
 * Hook to signal that a page has completed mounting and is ready to be revealed.
 * Can be called without arguments to trigger immediately on mount, or with a boolean
 * condition to trigger only when custom data is loaded.
 * 
 * @param isReadyOptional Optional boolean flag indicating custom readiness (e.g. API data loaded)
 */
export function usePageReadiness(isReadyOptional: boolean = true) {
  const { setPageReady } = useTransition();

  useEffect(() => {
    if (isReadyOptional) {
      // Small timeout to allow render paint and prevent flashing
      const timer = setTimeout(() => {
        setPageReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setPageReady(false);
    }
  }, [isReadyOptional, setPageReady]);
}
