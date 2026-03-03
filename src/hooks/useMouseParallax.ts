"use client";

/**
 * useMouseParallax — Tracks mouse position as normalized values
 * (-1 to 1) from viewport center, smoothed with lerp.
 * Used to subtly shift elements based on cursor position.
 */

import { useEffect, useRef } from "react";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";

const LERP = 0.06;

interface ParallaxValues {
  x: number;
  y: number;
}

export function useMouseParallax(): React.RefObject<ParallaxValues> {
  const current = useRef<ParallaxValues>({ x: 0, y: 0 });
  const target = useRef<ParallaxValues>({ x: 0, y: 0 });
  const device = useDeviceDetect();

  useEffect(() => {
    if (device.current.isTouch) return;
    function onMouseMove(e: MouseEvent) {
      // Normalize to -1 → 1 from viewport center
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    let raf: number;
    function tick() {
      current.current.x += (target.current.x - current.current.x) * LERP;
      current.current.y += (target.current.y - current.current.y) * LERP;
      raf = requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", onMouseMove);
    raf = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [device]);

  return current;
}
