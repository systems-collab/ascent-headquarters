"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  /** Target value to count up to. */
  end: number;
  /** Duration of the animation in milliseconds. */
  duration?: number;
  /** Set false to render the final value immediately (respects reduced motion). */
  enabled?: boolean;
}

/**
 * Animate a number from 0 to a target over a fixed duration using an
 * easeOutCubic curve. Respects prefers-reduced-motion by snapping to the
 * final value.
 */
export function useCountUp({
  end,
  duration = 1500,
  enabled = true,
}: UseCountUpOptions): number {
  const [value, setValue] = useState<number>(enabled ? 0 : end);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setValue(end);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    function step(timestamp: number) {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      startRef.current = null;
    };
  }, [end, duration, enabled]);

  return value;
}
