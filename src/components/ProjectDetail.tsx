"use client";

/**
 * ProjectDetail — Full detail page for a single project or writing piece.
 *
 * Renders title, preview image, description, tech stack, links,
 * and prev/next navigation. GSAP staggered enter animation
 * coordinates with the HUD wipe transition.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePageTransition } from "@/components/PageTransition";
import { MemoViewer } from "@/components/MemoViewer";
import { ALL_WORKS, type WorkItem, type Project, type Writing } from "@/lib/projectData";

function isProject(work: WorkItem): work is Project {
  return work.type === "project";
}

/** Returns the previous and next items in the works list, wrapping around */
function getAdjacentWorks(slug: string) {
  const idx = ALL_WORKS.findIndex((w) => w.slug === slug);
  const prev = ALL_WORKS[(idx - 1 + ALL_WORKS.length) % ALL_WORKS.length];
  const next = ALL_WORKS[(idx + 1) % ALL_WORKS.length];
  return { prev, next, index: idx };
}

export function ProjectDetail({ work }: { work: WorkItem }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = usePageTransition();
  const { prev, next, index } = getAdjacentWorks(work.slug);
  const project = isProject(work) ? work : null;
  const writing = !isProject(work) ? (work as Writing) : null;

  // Staggered enter animation — waits for HUD wipe to finish
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(el.querySelector("[data-anim='header']"),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);

    tl.fromTo(el.querySelector("[data-anim='title']"),
      { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.1);

    const image = el.querySelector("[data-anim='image']");
    if (image) {
      tl.fromTo(image,
        { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 0.15);
    }

    tl.fromTo(el.querySelector("[data-anim='description']"),
      { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.2);

    const tags = el.querySelectorAll("[data-anim='tag']");
    if (tags.length) {
      tl.fromTo(tags,
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.04 }, 0.3);
    }

    tl.fromTo(el.querySelectorAll("[data-anim='footer']"),
      { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.08 }, 0.35);

    return () => { tl.kill(); };
  }, [work.slug]);

  return (
    <main
      ref={containerRef}
      style={{ minHeight: "100vh", padding: "8vh 8vw", maxWidth: "64rem", margin: "0 auto" }}
    >
      {/* Header — back + index */}
      <div
        data-anim="header"
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: "4rem", opacity: 0,
        }}
      >
        <button
          data-cursor-hover
          onClick={() => navigateTo("/works")}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--font-mono)", fontSize: "0.65rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)", padding: "0.5rem 1.25rem", borderRadius: "2px",
            transition: "border-color 0.3s ease, color 0.3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >
          ← Back
        </button>
        <span
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em",
          }}
        >
          {String(index + 1).padStart(2, "0")} / {String(ALL_WORKS.length).padStart(2, "0")}
        </span>
      </div>

      {/* Title block */}
      <div data-anim="title" style={{ marginBottom: "3rem", opacity: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)", fontSize: "2.5rem",
              fontWeight: 300, letterSpacing: "-0.02em",
            }}
          >
            {work.title}
          </h1>
          <span
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.55rem",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: (project?.status === "Building") ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
              border: `1px solid ${(project?.status === "Building") ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
              padding: "0.15rem 0.5rem", borderRadius: "1px",
            }}
          >
            {project ? project.status : (writing?.readTime ?? "")}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.65rem",
            color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em",
          }}
        >
          {project ? project.year : writing?.date}
        </span>
      </div>

      {/* Preview image (conditional) */}
      {work.previewImage && (
        <div
          data-anim="image"
          className="relative"
          style={{
            marginBottom: "3rem", opacity: 0,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div className="hud-corner hud-corner--tl" />
          <div className="hud-corner hud-corner--tr" />
          <div className="hud-corner hud-corner--bl" />
          <div className="hud-corner hud-corner--br" />
          <img
            src={work.previewImage}
            alt={`${work.title} preview`}
            style={{ width: "100%", display: "block", borderRadius: "2px" }}
            loading="eager"
          />
        </div>
      )}

      {/* Description */}
      <div data-anim="description" style={{ marginBottom: "3rem", opacity: 0 }}>
        <h2
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)", marginBottom: "1rem",
          }}
        >
          Overview
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)", fontSize: "0.9rem",
            lineHeight: 1.8, color: "rgba(255,255,255,0.5)", maxWidth: "56rem",
          }}
        >
          {work.longDescription}
        </p>
      </div>

      {/* Full memo (writing pieces only) */}
      {writing && (
        <div data-anim="footer" style={{ opacity: 0 }}>
          <MemoViewer />
        </div>
      )}

      {/* Tech stack */}
      <div style={{ marginBottom: "3rem" }}>
        <h2
          data-anim="tag"
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)", marginBottom: "1rem", opacity: 0,
          }}
        >
          Tech Stack
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {work.tags.map((tag) => (
            <span
              key={tag}
              data-anim="tag"
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "0.25rem 0.75rem", borderRadius: "1px", opacity: 0,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      {project?.repo && (
        <div data-anim="footer" style={{ marginBottom: "4rem", opacity: 0 }}>
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover
            style={{
              display: "inline-block", background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "var(--font-mono)", fontSize: "0.65rem",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)", padding: "0.6rem 1.5rem",
              borderRadius: "2px", textDecoration: "none",
              transition: "border-color 0.3s ease, color 0.3s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            View on GitHub →
          </a>
        </div>
      )}

      {/* Prev / Next navigation */}
      <div
        data-anim="footer"
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.06)", opacity: 0,
        }}
      >
        <button
          data-cursor-hover
          onClick={() => navigateTo(`/works/${prev.slug}`)}
          style={{
            background: "none", border: "none",
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", textAlign: "left",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
        >
          ← {prev.title}
        </button>
        <button
          data-cursor-hover
          onClick={() => navigateTo(`/works/${next.slug}`)}
          style={{
            background: "none", border: "none",
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", textAlign: "right",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
        >
          {next.title} →
        </button>
      </div>
    </main>
  );
}
