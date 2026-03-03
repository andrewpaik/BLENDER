"use client";

/**
 * useScrollVelocity — Tracks scroll speed for reactive FX.
 * Reads velocity from the shared Lenis instance and smooths
 * it with lerp to prevent shader jitter.
 */

import { useEffect, useRef } from "react";
import { useLenis } from "@/lib/LenisProvider";

const SMOOTHING = 0.08;

export function useScrollVelocity(): React.RefObject<number> {
  const velocity = useRef(0);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    let raf: number;

    function tick() {
      // Lenis exposes .velocity — the current scroll speed in px/s
      const target = Math.abs(lenis!.velocity) / 1000;
      velocity.current += (target - velocity.current) * SMOOTHING;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lenis]);

  return velocity;
}
