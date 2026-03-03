"use client";

/**
 * CustomCursor — Smooth lerped cursor with magnetic attraction.
 * Hides the native cursor and renders a custom dot that follows
 * the mouse with slight delay. Pulls toward registered magnetic
 * targets when within their radius. Glow ring appears on attraction.
 */

import { useEffect, useRef, useState } from "react";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { findClosestMagnetic, refreshMagneticRects } from "@/hooks/useMagneticTargets";

const LERP = 0.1;
const SIZE = 8;

export function CustomCursor() {
  const device = useDeviceDetect();
  const [isTouch, setIsTouch] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const rawMouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const visible = useRef(false);

  useEffect(() => {
    setIsTouch(device.current.isTouch);
  }, [device]);

  useEffect(() => {
    if (isTouch) return;

    const dot = dotRef.current;
    if (!dot) return;

    function onMouseMove(e: MouseEvent) {
      rawMouse.current.x = e.clientX;
      rawMouse.current.y = e.clientY;
      if (!visible.current) {
        visible.current = true;
        pos.current.x = e.clientX;
        pos.current.y = e.clientY;
        dot!.style.opacity = "1";
      }
    }

    function onMouseLeave() {
      visible.current = false;
      dot!.style.opacity = "0";
    }

    let raf: number;
    function animate() {
      const magnetic = findClosestMagnetic(rawMouse.current.x, rawMouse.current.y);
      const tx = rawMouse.current.x + (magnetic?.offsetX ?? 0);
      const ty = rawMouse.current.y + (magnetic?.offsetY ?? 0);

      pos.current.x += (tx - pos.current.x) * LERP;
      pos.current.y += (ty - pos.current.y) * LERP;

      dot!.style.transform = `translate(${pos.current.x - SIZE / 2}px, ${pos.current.y - SIZE / 2}px)`;

      raf = requestAnimationFrame(animate);
    }

    // Refresh magnetic rects on scroll (throttled)
    let scrollThrottle: ReturnType<typeof setTimeout> | null = null;
    function onScroll() {
      if (scrollThrottle) return;
      scrollThrottle = setTimeout(() => {
        refreshMagneticRects();
        scrollThrottle = null;
      }, 100);
    }

    // Refresh on resize (debounced)
    let resizeTimeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => refreshMagneticRects(), 150);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      if (scrollThrottle) clearTimeout(scrollThrottle);
      clearTimeout(resizeTimeout);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-50 pointer-events-none"
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          opacity: 0,
          transition: "opacity 0.3s ease",
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
