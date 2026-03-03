"use client";

/**
 * PageTransition — HUD shutter wipe between pages.
 *
 * A black panel sweeps down to cover the screen (with a bright
 * leading edge), navigates, then sweeps up to reveal the new page.
 */

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

interface PageTransitionContextValue {
  navigateTo: (url: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigateTo: () => {},
});

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const navigateTo = useCallback(
    (url: string) => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      const overlay = overlayRef.current;
      const panel = panelRef.current;
      const edge = edgeRef.current;
      if (!overlay || !panel || !edge) {
        router.push(url);
        return;
      }

      overlay.style.pointerEvents = "auto";

      // EXIT — shutter closes downward
      const exitTl = gsap.timeline({
        onComplete: () => {
          router.push(url);

          // ENTER — shutter opens upward after page mounts
          setTimeout(() => {
            const enterTl = gsap.timeline({
              onComplete: () => {
                overlay.style.pointerEvents = "none";
                isAnimating.current = false;
              },
            });

            // Edge line appears at bottom, sweeps up
            enterTl.fromTo(
              edge,
              { top: "100%", opacity: 1 },
              { top: "-2px", duration: 0.5, ease: "power2.inOut" },
              0,
            );

            // Panel reveals upward (follows the edge)
            enterTl.to(
              panel,
              { clipPath: "inset(0 0 100% 0)", duration: 0.5, ease: "power2.inOut" },
              0.05,
            );

            // Edge fades out at top
            enterTl.to(edge, { opacity: 0, duration: 0.15 }, 0.45);
          }, 150);
        },
      });

      // Edge line at top, sweeps down
      exitTl.fromTo(
        edge,
        { top: "-2px", opacity: 1 },
        { top: "100%", duration: 0.5, ease: "power2.inOut" },
        0,
      );

      // Panel wipes down (follows the edge)
      exitTl.fromTo(
        panel,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.5, ease: "power2.inOut" },
        0.05,
      );
    },
    [router],
  );

  return (
    <PageTransitionContext.Provider value={{ navigateTo }}>
      {children}

      {/* Transition overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0"
        style={{ zIndex: 100, pointerEvents: "none" }}
      >
        {/* Black shutter panel */}
        <div
          ref={panelRef}
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            clipPath: "inset(0 0 100% 0)",
          }}
        />

        {/* Bright leading edge — 1px white line */}
        <div
          ref={edgeRef}
          style={{
            position: "absolute",
            left: 0,
            width: "100%",
            height: "2px",
            top: "-2px",
            opacity: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 80%, transparent 100%)",
            boxShadow: "0 0 12px rgba(255,255,255,0.3)",
          }}
        />
      </div>
    </PageTransitionContext.Provider>
  );
}
