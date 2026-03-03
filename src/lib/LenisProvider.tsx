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
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";

gsap.registerPlugin(ScrollTrigger);

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

  useEffect(() => {
    const isTouch = device.current.isTouch;

    const instance = new Lenis({
      lerp: isTouch ? 0.06 : 0.012,
      duration: isTouch ? 1.4 : 2.8,
      smoothWheel: true,
      touchMultiplier: isTouch ? 2.0 : 1.2,
    });

    // Bridge: on every Lenis scroll event, tell ScrollTrigger to re-evaluate
    instance.on("scroll", ScrollTrigger.update);

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
