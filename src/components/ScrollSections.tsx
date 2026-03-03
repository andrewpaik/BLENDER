"use client";

/**
 * ScrollSections — Phase 2 + Phase 3 text reveals + parallax
 *
 * Renders fixed content overlays for each scroll section.
 * Headings use GSAP SplitText for per-character staggered reveals.
 * ScrollTrigger scrubs the timelines based on marker div position.
 * Mouse parallax subtly shifts content based on cursor position.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { scrollSections } from "@/lib/scrollConfig";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { registerMagnetic } from "@/hooks/useMagneticTargets";
import { usePageTransition } from "@/components/PageTransition";
import type { ScrollSection, SectionPosition, ProjectItem, ContactLink } from "@/lib/scrollConfig";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Inline styles for each position variant */
const positionStyles: Record<SectionPosition, React.CSSProperties> = {
  "top-right": { alignItems: "flex-start", justifyContent: "flex-end", paddingTop: "8vh", paddingRight: "6vw", textAlign: "right" },
  "top-left": { alignItems: "flex-start", justifyContent: "flex-start", paddingTop: "8vh", paddingLeft: "6vw", textAlign: "left" },
  "top-center": { alignItems: "flex-start", justifyContent: "center", paddingTop: "16vh", textAlign: "center" },
  "center-top": { alignItems: "center", justifyContent: "center", textAlign: "center" },
  "center": { alignItems: "center", justifyContent: "center", textAlign: "center" },
  "bottom-center": { alignItems: "flex-end", justifyContent: "center", paddingBottom: "8vh", textAlign: "center" },
};

/** Content offset per section for fine-tuning placement */
const sectionOffsets: Record<string, React.CSSProperties> = {
  hero: { transform: "translate(15vw, -12vh)" },
  closing: { transform: "translate(-15vw, -8vh)" },
};

/** Parallax intensity — entire HUD shifts with mouse (pixels at full offset) */
const PARALLAX_HUD = 24;

function SectionOverlay({ section }: { section: ScrollSection }) {
  const { navigateTo } = usePageTransition();
  const posStyle = positionStyles[section.position];
  const isHero = section.id === "hero";
  const isShowcase = section.id === "showcase";
  const isClosing = section.id === "closing";
  const isCentered = ["center", "center-top", "top-center", "bottom-center"].includes(section.position);
  const offset = sectionOffsets[section.id];

  return (
    <div
      data-section={section.id}
      className="fixed inset-0 z-10 flex pointer-events-none"
      style={{ opacity: 0, ...posStyle }}
    >
      {/* Showcase gets a different layout — heading panel + separate card HUDs */}
      {isShowcase ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "56rem" }}>
          {/* Heading panel */}
          <div
            className="relative"
            data-animate="panel"
            style={{
              clipPath: "inset(50% 50% 50% 50%)",
              padding: "2rem 3rem",
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div data-animate="scanline" className="absolute top-0 left-0 w-full h-[1px] bg-white/20" style={{ transformOrigin: "left center", transform: "scaleX(0)" }} />
            <div className="hud-corner hud-corner--tl" data-animate="corner" />
            <div className="hud-corner hud-corner--tr" data-animate="corner" />
            <div className="hud-corner hud-corner--bl" data-animate="corner" />
            <div className="hud-corner hud-corner--br" data-animate="corner" />
            <div style={{ display: "flex", alignItems: "baseline", gap: "1.5rem" }}>
              <h2 className="font-[family-name:var(--font-display)] font-light tracking-tight text-2xl md:text-4xl lg:text-5xl" data-animate="heading">
                {section.label}
              </h2>
              <button
                onClick={() => navigateTo("/works")}
                data-cursor-hover
                data-animate="body"
                className="pointer-events-auto"
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >
                View All →
              </button>
            </div>
          </div>

          {/* Project cards — each is its own HUD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-animate="cards">
            {section.projects?.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </div>
      ) : (
        /* Standard HUD panel for all other sections */
        <div
          className="relative max-w-xl"
          data-animate="panel"
          style={{
            clipPath: "inset(50% 50% 50% 50%)",
            padding: "3.5rem 4rem",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: isCentered ? "center" : "flex-start",
            textAlign: isCentered ? "center" : "left",
            ...offset,
          }}
        >
          <div data-animate="scanline" className="absolute top-0 left-0 w-full h-[1px] bg-white/20" style={{ transformOrigin: "left center", transform: "scaleX(0)" }} />
          <div className="hud-corner hud-corner--tl" data-animate="corner" />
          <div className="hud-corner hud-corner--tr" data-animate="corner" />
          <div className="hud-corner hud-corner--bl" data-animate="corner" />
          <div className="hud-corner hud-corner--br" data-animate="corner" />

          <h2
            className={`font-[family-name:var(--font-display)] font-light tracking-tight ${
              isHero ? "text-3xl md:text-5xl lg:text-6xl" : "text-2xl md:text-4xl lg:text-5xl"
            }`}
            data-animate="heading"
          >
            {section.label}
          </h2>

          {section.subtitle && (
            <p
              className={`font-[family-name:var(--font-body)] text-white/50 leading-relaxed ${
                isClosing
                  ? "text-xs md:text-sm tracking-widest font-[family-name:var(--font-mono)]"
                  : "text-sm md:text-base"
              }`}
              data-animate="body"
              style={{ marginTop: "2rem" }}
            >
              {section.subtitle}
            </p>
          )}

          {section.contacts && (
            <div className="flex gap-6" data-animate="contacts" style={{ marginTop: "2rem" }}>
              {section.contacts.map((contact) => (
                <ContactItem key={contact.platform} contact={contact} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectItem }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const unregister = registerMagnetic(el);
    const corners = el.querySelectorAll(".hud-corner");
    const scanline = el.querySelector("[data-card-scanline]");

    function getSiblings(): HTMLElement[] {
      const parent = el!.parentElement;
      if (!parent) return [];
      return Array.from(parent.querySelectorAll("[data-project-card]")).filter((c) => c !== el) as HTMLElement[];
    }

    function onEnter() {
      // Hovered card — expand, brighten, glow
      gsap.to(el, {
        y: -6, scale: 1.03,
        borderColor: "rgba(255,255,255,0.3)",
        boxShadow: "0 0 30px rgba(255,255,255,0.1), inset 0 0 20px rgba(255,255,255,0.04)",
        backgroundColor: "rgba(0,0,0,0.7)",
        filter: "brightness(1.2)",
        duration: 0.4, ease: "power2.out", overwrite: "auto",
      });
      gsap.to(corners, {
        borderColor: "rgba(255,255,255,0.5)",
        duration: 0.3, ease: "power2.out",
      });
      if (scanline) {
        gsap.fromTo(scanline, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.inOut" });
      }

      // Siblings — dim and shrink (use filter instead of opacity to avoid ScrollTrigger conflict)
      gsap.to(getSiblings(), {
        filter: "brightness(0.3)",
        scale: 0.97,
        duration: 0.4, ease: "power2.out", overwrite: "auto",
      });
    }

    function onLeave() {
      // Reset hovered card
      gsap.to(el, {
        y: 0, scale: 1,
        borderColor: "rgba(255,255,255,0.1)",
        boxShadow: "none",
        backgroundColor: "rgba(0,0,0,0.5)",
        filter: "brightness(1)",
        duration: 0.3, ease: "power2.inOut", overwrite: "auto",
      });
      gsap.to(corners, {
        borderColor: "rgba(255,255,255,0.2)",
        duration: 0.25, ease: "power2.inOut",
      });
      if (scanline) gsap.to(scanline, { scaleX: 0, duration: 0.2, ease: "power2.in" });

      // Restore siblings
      gsap.to(getSiblings(), {
        filter: "brightness(1)",
        scale: 1,
        duration: 0.3, ease: "power2.inOut", overwrite: "auto",
      });
    }

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      unregister();
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
      gsap.killTweensOf(corners);
      gsap.killTweensOf(getSiblings());
      if (scanline) gsap.killTweensOf(scanline);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      data-project-card
      data-cursor-hover
      data-magnetic-radius="100"
      data-magnetic-strength="0.3"
      className="relative pointer-events-auto"
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "2px",
        padding: "1.5rem 1.75rem",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        willChange: "transform",
      }}
    >
      {/* HUD corners — always visible, brighten on hover */}
      <div className="hud-corner hud-corner--tl" />
      <div className="hud-corner hud-corner--tr" />
      <div className="hud-corner hud-corner--bl" />
      <div className="hud-corner hud-corner--br" />

      {/* Scan line — sweeps on hover */}
      <div
        data-card-scanline
        className="absolute top-0 left-0 w-full h-[1px] bg-white/20"
        style={{ transformOrigin: "left center", transform: "scaleX(0)" }}
      />

      <h3 className="font-[family-name:var(--font-display)] text-lg font-light tracking-wide text-white/90">
        {project.title}
      </h3>
      <p className="font-[family-name:var(--font-body)] text-sm text-white/40 leading-relaxed" style={{ marginTop: "0.5rem" }}>
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2" style={{ marginTop: "0.75rem" }}>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-white/25 border border-white/8 rounded-sm px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContactItem({ contact }: { contact: ContactLink }) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = linkRef.current;
    if (!el) return;

    const unregister = registerMagnetic(el);
    const underline = el.querySelector("[data-contact-underline]");

    function onEnter() {
      gsap.to(el, {
        y: -2,
        borderColor: "rgba(255,255,255,0.4)",
        backgroundColor: "rgba(255,255,255,0.08)",
        duration: 0.3, ease: "power2.out", overwrite: "auto",
      });
      if (underline) {
        gsap.fromTo(underline, { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power2.inOut" });
      }
    }

    function onLeave() {
      gsap.to(el, {
        y: 0,
        borderColor: "rgba(255,255,255,0.1)",
        backgroundColor: "rgba(255,255,255,0)",
        duration: 0.25, ease: "power2.inOut", overwrite: "auto",
      });
      if (underline) gsap.to(underline, { scaleX: 0, duration: 0.2, ease: "power2.in" });
    }

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      unregister();
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
      if (underline) gsap.killTweensOf(underline);
    };
  }, []);

  return (
    <a
      ref={linkRef}
      href={contact.href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-hover
      data-magnetic-radius="80"
      data-magnetic-strength="0.4"
      className="relative pointer-events-auto flex items-center gap-3 rounded-sm px-5 py-3"
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        willChange: "transform",
      }}
    >
      <span className="font-[family-name:var(--font-display)] text-sm font-light tracking-wider text-white/70">
        {contact.platform}
      </span>
      <span className="font-[family-name:var(--font-mono)] text-xs text-white/30">
        {contact.handle}
      </span>
      {/* HUD underline sweep */}
      <div
        data-contact-underline
        className="absolute bottom-0 left-0 w-full h-[1px] bg-white/20"
        style={{ transformOrigin: "left center", transform: "scaleX(0)" }}
      />
    </a>
  );
}

export function ScrollSections() {
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const splitsRef = useRef<SplitText[]>([]);
  const parallax = useMouseParallax();
  const device = useDeviceDetect();

  // Mouse parallax — shift entire HUD sections with mouse
  useEffect(() => {
    if (device.current.isTouch) return;

    const sections = document.querySelectorAll<HTMLElement>("[data-section]");

    let raf: number;
    function tick() {
      const px = parallax.current.x;
      const py = parallax.current.y;

      sections.forEach((el) => {
        el.style.transform = `translate(${px * PARALLAX_HUD}px, ${py * PARALLAX_HUD}px)`;
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [parallax, device]);

  // ScrollTrigger-driven text reveal animations
  useEffect(() => {
    if (scrollSections.length === 0) return;

    const timer = setTimeout(() => {
      scrollSections.forEach((section) => {
        const marker = document.querySelector(
          `[data-marker="${section.id}"]`,
        ) as HTMLElement | null;
        const contentEl = document.querySelector(
          `[data-section="${section.id}"]`,
        ) as HTMLElement | null;

        if (!marker || !contentEl) return;

        const panel = contentEl.querySelector("[data-animate='panel']") as HTMLElement | null;
        const scanline = contentEl.querySelector("[data-animate='scanline']") as HTMLElement | null;
        const corners = contentEl.querySelectorAll("[data-animate='corner']");
        const heading = contentEl.querySelector("[data-animate='heading']") as HTMLElement | null;
        const body = contentEl.querySelector("[data-animate='body']") as HTMLElement | null;
        const cards = contentEl.querySelector("[data-animate='cards']") as HTMLElement | null;
        const contacts = contentEl.querySelector("[data-animate='contacts']") as HTMLElement | null;

        if (!heading || !panel) return;

        // Split heading into characters for staggered reveal
        const split = new SplitText(heading, {
          type: "chars",
        });
        splitsRef.current.push(split);

        const chars = split.chars;

        const tl = gsap.timeline({ paused: true });

        // ========================================
        // ENTER — Iron Man HUD materialization
        // ========================================

        // 0.00 — Make container visible
        tl.fromTo(
          contentEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.01 },
          0,
        );

        // 0.00 — Scan line sweeps across
        if (scanline) {
          tl.fromTo(
            scanline,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.15, ease: "power2.inOut" },
            0,
          );
        }

        // 0.05 — Panel clips open from center
        tl.fromTo(
          panel,
          { clipPath: "inset(50% 50% 50% 50%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.2, ease: "power2.inOut" },
          0.05,
        );

        // 0.10 — Corner brackets materialize
        if (corners.length > 0) {
          tl.fromTo(
            corners,
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.1, ease: "power2.out", stagger: 0.025 },
            0.1,
          );
        }

        // 0.14 — Heading chars snap in (tight stagger, mechanical feel)
        tl.fromTo(
          chars,
          {
            opacity: 0,
            y: 20,
            rotateX: -30,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.12,
            ease: "power2.inOut",
            stagger: 0.01,
          },
          0.14,
        );

        // 0.16 — Quick HUD flicker on heading (data loading feel)
        tl.to(heading, { opacity: 0.4, duration: 0.02 }, 0.22);
        tl.to(heading, { opacity: 1, duration: 0.02 }, 0.24);

        // 0.20 — Body text fade in
        if (body) {
          tl.fromTo(
            body,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" },
            0.2,
          );
        }

        // 0.24 — Project cards stagger in
        if (cards) {
          tl.fromTo(
            cards.children,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.1, ease: "power2.out", stagger: 0.03 },
            0.24,
          );
        }

        // 0.24 — Contact links stagger in
        if (contacts) {
          tl.fromTo(
            contacts.children,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.1, ease: "power2.out", stagger: 0.04 },
            0.24,
          );
        }

        // ========================================
        // HOLD
        // ========================================
        tl.to({}, { duration: 0.4 });

        // ========================================
        // EXIT — Reverse assembly: content → panel → scanline
        // ========================================

        // Content fades
        if (cards) {
          tl.to(cards.children, {
            opacity: 0, y: -10, duration: 0.06, ease: "power2.in", stagger: 0.015,
          });
        }

        if (contacts) {
          tl.to(contacts.children, {
            opacity: 0, y: -8, duration: 0.06, ease: "power2.in", stagger: 0.015,
          }, "-=0.04");
        }

        if (body) {
          tl.to(body, {
            opacity: 0, y: -10, duration: 0.06, ease: "power2.in",
          }, "-=0.04");
        }

        // Chars exit
        tl.to(chars, {
          opacity: 0, y: -15, duration: 0.08, ease: "power2.in", stagger: 0.008,
        }, "-=0.04");

        // Corners vanish
        if (corners.length > 0) {
          tl.to(corners, {
            opacity: 0, scale: 0, duration: 0.06, ease: "power2.in", stagger: 0.015,
          }, "-=0.04");
        }

        // Panel clips shut
        tl.to(panel, {
          clipPath: "inset(50% 50% 50% 50%)", duration: 0.12, ease: "power2.inOut",
        }, "-=0.04");

        // Scan line collapses
        if (scanline) {
          tl.to(scanline, {
            scaleX: 0, duration: 0.1, ease: "power2.inOut",
          }, "-=0.08");
        }

        // Final container fade
        tl.to(contentEl, { opacity: 0, duration: 0.02 });

        const trigger = ScrollTrigger.create({
          trigger: marker,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          animation: tl,
          id: section.id,
        });

        triggersRef.current.push(trigger);
      });

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      triggersRef.current.forEach((t) => {
        t.animation?.kill();
        t.kill();
      });
      triggersRef.current = [];
      splitsRef.current.forEach((s) => s?.revert());
      splitsRef.current = [];
    };
  }, []);

  if (scrollSections.length === 0) return null;

  return (
    <>
      {scrollSections.map((section) => (
        <SectionOverlay key={section.id} section={section} />
      ))}
    </>
  );
}

