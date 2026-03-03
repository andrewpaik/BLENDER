"use client";

/**
 * LenisProvider — Shared Lenis smooth scroll instance with
 * GSAP ScrollTrigger integration. Lenis drives the scroll
 * pipeline; ScrollTrigger reads from it for animation timing.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";

gsap.registerPlugin(ScrollTrigger);

/** How close (px) to a section marker edge to trigger snap */
const SNAP_THRESHOLD = 120;
/** Velocity (px/s) below which snap engages after scrolling */
const SNAP_VELOCITY = 30;

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function useLenis(): Lenis | null {
  return useContext(LenisContext).lenis;
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const device = useDeviceDetect();
  const snapCooldown = useRef(false);

  useEffect(() => {
    const isTouch = device.current.isTouch;

    const instance = new Lenis({
      lerp: isTouch ? 0.06 : 0.018,
      duration: isTouch ? 1.4 : 2.2,
      smoothWheel: true,
      touchMultiplier: isTouch ? 2.0 : 1.2,
    });

    // Bridge: on every Lenis scroll event, tell ScrollTrigger to re-evaluate
    instance.on("scroll", ScrollTrigger.update);

    // Snap-to-section: when velocity drops near a section boundary,
    // gently pull the user into the resistance zone entrance.
    instance.on("scroll", (e: Lenis) => {
      if (snapCooldown.current) return;

      const vel = Math.abs(e.velocity);
      // Only snap when decelerating (not at rest, not while actively scrolling)
      if (vel < SNAP_VELOCITY && vel > 0.5) {
        const scrollY = e.scroll;
        const markers = document.querySelectorAll<HTMLElement>("[data-marker]");

        for (const marker of markers) {
          const top = marker.offsetTop;
          const dist = top - scrollY;

          // If we're just above the section entrance, snap into it
          if (dist > 0 && dist < SNAP_THRESHOLD) {
            snapCooldown.current = true;
            instance.scrollTo(top, { duration: 0.8 });
            setTimeout(() => { snapCooldown.current = false; }, 1200);
            break;
          }
        }
      }
    });

    // Drive Lenis from GSAP's ticker instead of a manual rAF loop.
    // This keeps Lenis and GSAP animations perfectly in sync.
    const tickerCallback = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(tickerCallback);
      ScrollTrigger.killAll();
      instance.destroy();
    };
  }, [device]);

  return (
    <LenisContext.Provider value={{ lenis }}>
      {children}
    </LenisContext.Provider>
  );
}
