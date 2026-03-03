"use client";

/**
 * useSmoothValue — Lerp/dampen any value over frames.
 * Wraps a target value with rAF-driven interpolation
 * for buttery-smooth transitions.
 */

import { useEffect, useRef } from "react";

export function useSmoothValue(target: number, smoothing = 0.1): React.RefObject<number> {
  const current = useRef(target);

  useEffect(() => {
    let raf: number;

    function tick() {
      current.current += (target - current.current) * smoothing;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, smoothing]);

  return current;
}
