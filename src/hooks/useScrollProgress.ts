"use client";

/**
 * useScrollProgress — Returns normalized scroll progress (0→1)
 * across the full document height. Updated via scroll event
 * listener, consumed in rAF loop with interpolation.
 */

import { useEffect, useRef } from "react";

export function useScrollProgress(): React.RefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    function onScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return progress;
}
