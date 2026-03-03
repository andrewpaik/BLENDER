"use client";

/**
 * MemoViewer — Expandable full-text reader for the investment memo.
 *
 * Collapsed: shows a "Read Full Memo" button.
 * Expanded: renders all sections with a smooth GSAP reveal,
 * wrapped in a HUD-cornered container.
 */

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { LAYERZERO_MEMO } from "@/lib/memoContent";

export function MemoViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function toggle() {
    if (isOpen) {
      // Collapse
      const el = wrapperRef.current;
      if (el) {
        gsap.to(el, {
          height: 0, opacity: 0, duration: 0.4, ease: "power2.inOut",
          onComplete: () => setIsOpen(false),
        });
      }
    } else {
      // Expand
      setIsOpen(true);
    }
  }

  // After the content mounts, animate it open
  function onContentMount(el: HTMLDivElement | null) {
    if (!el || !isOpen) return;
    wrapperRef.current = el;

    // Measure natural height then animate from 0
    const naturalHeight = el.scrollHeight;
    gsap.fromTo(el,
      { height: 0, opacity: 0 },
      { height: naturalHeight, opacity: 1, duration: 0.5, ease: "power2.out",
        onComplete: () => { el.style.height = "auto"; } },
    );

    // Stagger section headings
    const sections = el.querySelectorAll("[data-memo-section]");
    gsap.fromTo(sections,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.05, delay: 0.15 },
    );
  }

  return (
    <div style={{ marginBottom: "3rem" }}>
      {/* Toggle button */}
      <button
        data-cursor-hover
        onClick={toggle}
        style={{
          background: "none",
          border: "1px solid rgba(255,255,255,0.15)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          padding: "0.7rem 1.75rem",
          borderRadius: "2px",
          transition: "border-color 0.3s ease, color 0.3s ease",
          marginBottom: isOpen ? "1.5rem" : 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
          e.currentTarget.style.color = "rgba(255,255,255,0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
        }}
      >
        {isOpen ? "Close Memo ↑" : "Read Full Memo ↓"}
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div
          ref={(el) => { contentRef.current = el; onContentMount(el); }}
          style={{ overflow: "hidden" }}
        >
          <div
            className="relative"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "2px",
              padding: "3rem 3rem 2.5rem",
            }}
          >
            <div className="hud-corner hud-corner--tl" />
            <div className="hud-corner hud-corner--tr" />
            <div className="hud-corner hud-corner--bl" />
            <div className="hud-corner hud-corner--br" />

            {/* Memo title */}
            <div
              data-memo-section
              style={{
                marginBottom: "2.5rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                opacity: 0,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontWeight: 300,
                  letterSpacing: "-0.01em",
                  marginBottom: "0.5rem",
                }}
              >
                LayerZero (ZRO): Investment Memo
              </h3>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                }}
              >
                February 2026 · 16 min read · Andrew Paik
              </span>
            </div>

            {/* Sections */}
            {LAYERZERO_MEMO.map((section, i) => (
              <div
                key={i}
                data-memo-section
                style={{
                  marginBottom: i < LAYERZERO_MEMO.length - 1 ? "2.25rem" : 0,
                  opacity: 0,
                }}
              >
                <h4
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}. {section.heading}
                </h4>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    lineHeight: 1.85,
                    color: "rgba(255,255,255,0.45)",
                    whiteSpace: "pre-line",
                    maxWidth: "56rem",
                  }}
                >
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
