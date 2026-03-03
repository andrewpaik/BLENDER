"use client";

/**
 * useDeviceDetect — Shared device capability detection.
 * Returns a stable ref with isTouch, isMobile, and maxDpr.
 * Uses a ref (not state) to avoid re-renders that would
 * tear down canvas loops and GSAP timelines.
 */

import { useEffect, useRef } from "react";

interface DeviceInfo {
  /** True when primary pointer is coarse (touch) */
  isTouch: boolean;
  /** True when viewport width is below 768px */
  isMobile: boolean;
  /** Recommended max DPR for canvas rendering (capped at 2) */
  maxDpr: number;
}

const MOBILE_BREAKPOINT = 768;

function detect(): DeviceInfo {
  if (typeof window === "undefined") {
    return { isTouch: false, isMobile: false, maxDpr: 2 };
  }

  const isTouch =
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  const maxDpr = Math.min(window.devicePixelRatio || 1, 2);

  return { isTouch, isMobile, maxDpr };
}

export function useDeviceDetect(): React.RefObject<DeviceInfo> {
  const info = useRef<DeviceInfo>(detect());

  useEffect(() => {
    info.current = detect();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        info.current = detect();
      }, 200);
    }

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return info;
}
