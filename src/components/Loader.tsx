"use client";

/**
 * Loader — Cinematic preloader with animated intro sequence.
 * Shows progress while frames load, then plays a reveal
 * animation before handing off to the main experience.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface LoaderProps {
  progress: number;
  isLoaded: boolean;
}

export function Loader({ progress, isLoaded }: LoaderProps) {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLParagraphElement>(null);
  const hasAnimated = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Cinematic exit animation when loading completes
  useEffect(() => {
    if (!isLoaded || hasAnimated.current) return;
    hasAnimated.current = true;

    const container = containerRef.current;
    const title = titleRef.current;
    const bar = barRef.current;
    const percent = percentRef.current;
    if (!container || !title || !bar || !percent) return;

    const tl = gsap.timeline({
      onComplete: () => setVisible(false),
      delay: 0.6,
    });
    tlRef.current = tl;

    // Fade out progress elements
    tl.to([percent, bar], {
      opacity: 0,
      y: -15,
      duration: 0.8,
      ease: "power2.in",
      stagger: 0.1,
    });

    // Hold on title for a beat
    tl.to({}, { duration: 0.5 });

    // Title scales up subtly and fades
    tl.to(title, {
      opacity: 0,
      scale: 1.15,
      letterSpacing: "0.6em",
      duration: 1.2,
      ease: "power2.inOut",
    });

    // Container fades to reveal
    tl.to(container, {
      opacity: 0,
      duration: 1.0,
      ease: "power3.inOut",
    }, "-=0.6");

    return () => {
      tlRef.current?.kill();
    };
  }, [isLoaded]);

  if (!visible) return null;

  const percentage = Math.round(progress * 100);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      {/* Title */}
      <h1
        ref={titleRef}
        className="mb-12 font-[family-name:var(--font-display)] text-2xl font-light tracking-[0.3em] text-white/70"
      >
        ANDREW PAIK
      </h1>

      {/* Percentage counter */}
      <p
        ref={percentRef}
        className="mb-6 font-[family-name:var(--font-mono)] text-xs tracking-[0.5em] text-white/30"
      >
        {percentage}
      </p>

      {/* Progress bar */}
      <div
        ref={barRef}
        className="relative h-[1px] w-56 overflow-hidden bg-white/10"
      >
        <div
          className="absolute left-0 top-0 h-full bg-white/60"
          style={{
            width: `${progress * 100}%`,
            transition: "width 0.2s ease-out",
          }}
        />
      </div>
    </div>
  );
}
