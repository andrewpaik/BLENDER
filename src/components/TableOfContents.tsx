"use client";

/**
 * TableOfContents — Fixed right-side navigation.
 *
 * Minimal HUD-style nav that tracks the active scroll section
 * and allows click-to-scroll navigation. Hidden on touch devices.
 */

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/lib/LenisProvider";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { usePageTransition } from "@/components/PageTransition";

interface NavItem {
  label: string;
  sectionId?: string;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", sectionId: "hero" },
  { label: "About Me", sectionId: "intro" },
  { label: "Selected Works", sectionId: "showcase" },
  { label: "Get In Touch", sectionId: "closing" },
  { label: "Full Works", href: "/works" },
];

export function TableOfContents() {
  const device = useDeviceDetect();
  const [isTouch, setIsTouch] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const lenis = useLenis();
  const { navigateTo } = usePageTransition();
  const rafRef = useRef<number>(0);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTouch(device.current.isTouch);
  }, [device]);

  // Track which section is active by polling ScrollTrigger instances
  useEffect(() => {
    if (isTouch) return;

    function tick() {
      const sectionIds = ["hero", "intro", "showcase", "closing"];
      let current: string | null = null;

      for (const id of sectionIds) {
        const trigger = ScrollTrigger.getById(id);
        if (trigger?.isActive) {
          current = id;
          break;
        }
      }

      setActiveId((prev) => (prev !== current ? current : prev));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isTouch]);

  // Fade scroll hint as user scrolls
  useEffect(() => {
    if (isTouch || !lenis) return;

    function onScroll() {
      const hint = scrollHintRef.current;
      if (!hint) return;
      // Fade out over the first 300px of scroll
      const opacity = Math.max(0, 1 - window.scrollY / 300);
      hint.style.opacity = String(opacity);
    }

    lenis.on("scroll", onScroll);
    return () => { lenis.off("scroll", onScroll); };
  }, [isTouch, lenis]);

  function scrollTo(sectionId: string) {
    const marker = document.querySelector(`[data-marker="${sectionId}"]`) as HTMLElement | null;
    if (marker && lenis) {
      // Offset 35% into the marker so the timeline lands in the "hold" phase
      // where the HUD content is fully visible (past the enter animation)
      const offset = marker.offsetHeight * 0.35;
      lenis.scrollTo(marker, { offset });
    }
  }

  if (isTouch) return null;

  return (
    <nav
      className="fixed z-20 pointer-events-none"
      style={{
        right: "3vw",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.sectionId === activeId;

          if (item.href) {
            return (
              <li key={item.label}>
                <button
                  onClick={() => navigateTo(item.href!)}
                  data-cursor-hover
                  className="pointer-events-auto"
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    paddingLeft: "0.75rem",
                    borderLeft: "1px solid transparent",
                    transition: "color 0.3s ease, border-color 0.3s ease",
                    textAlign: "right",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <button
                onClick={() => scrollTo(item.sectionId!)}
                data-cursor-hover
                className="pointer-events-auto"
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                  paddingLeft: "0.75rem",
                  borderLeft: isActive
                    ? "1px solid rgba(255,255,255,0.4)"
                    : "1px solid transparent",
                  transition: "color 0.3s ease, border-color 0.3s ease",
                  textAlign: "right",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                }}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Scroll indicator — starts bright, fades as user scrolls */}
      <div
        ref={scrollHintRef}
        style={{
          marginTop: "2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
          opacity: 1,
          transition: "opacity 0.1s ease-out",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Scroll
        </span>
        <svg
          width="12"
          height="18"
          viewBox="0 0 12 18"
          fill="none"
        >
          <path
            d="M6 1L6 15M6 15L1 10M6 15L11 10"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </nav>
  );
}
