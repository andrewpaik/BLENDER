"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePageTransition } from "@/components/PageTransition";
import { PROJECTS, WRITING } from "@/lib/projectData";

export default function WorksPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = usePageTransition();

  // Staggered HUD enter animation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const tl = gsap.timeline({ delay: 0.3 });

    const header = el.querySelector("[data-anim='header']");
    if (header) {
      tl.fromTo(header, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);
    }

    const sectionHeadings = el.querySelectorAll("[data-anim='section-heading']");
    tl.fromTo(sectionHeadings, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.1 }, 0.2);

    const cards = el.querySelectorAll("[data-anim='card']");
    tl.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.06 }, 0.3);

    return () => { tl.kill(); };
  }, []);

  return (
    <main
      ref={containerRef}
      style={{
        minHeight: "100vh",
        padding: "8vh 8vw",
        maxWidth: "72rem",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        data-anim="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "6rem",
          opacity: 0,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.5rem",
            fontWeight: 300,
            letterSpacing: "-0.02em",
          }}
        >
          Full Works
        </h1>
        <button
          data-cursor-hover
          onClick={() => navigateTo("/")}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            padding: "0.5rem 1.25rem",
            borderRadius: "2px",
            transition: "border-color 0.3s ease, color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          ← Back
        </button>
      </div>

      {/* Projects Section */}
      <section style={{ marginBottom: "6rem" }}>
        <div
          data-anim="section-heading"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2.5rem",
            opacity: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            Projects
          </h2>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
            }}
          >
            {PROJECTS.length} WORKS
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {PROJECTS.map((project) => (
            <div
              key={project.slug}
              data-anim="card"
              data-cursor-hover
              className="relative"
              onClick={() => navigateTo(`/works/${project.slug}`)}
              style={{
                padding: "2rem 2.5rem",
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "2px",
                opacity: 0,
                cursor: "pointer",
                transition: "border-color 0.3s ease, background 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(0,0,0,0.4)";
              }}
            >
              {/* HUD corners */}
              <div className="hud-corner hud-corner--tl" />
              <div className="hud-corner hud-corner--tr" />
              <div className="hud-corner hud-corner--bl" />
              <div className="hud-corner hud-corner--br" />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
                <div style={{ flex: 1 }}>
                  {/* Title row */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.75rem" }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.35rem",
                        fontWeight: 300,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {project.title}
                    </h3>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.55rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: project.status === "Building" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
                        border: `1px solid ${project.status === "Building" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "1px",
                      }}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Short description on the listing page */}
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.45)",
                      marginBottom: "1rem",
                      maxWidth: "48rem",
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.55rem",
                          letterSpacing: "0.08em",
                          color: "rgba(255,255,255,0.2)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "1px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side — year + link */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem", flexShrink: 0 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.2)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {project.year}
                  </span>
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-hover
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.08em",
                        color: "rgba(255,255,255,0.35)",
                        textDecoration: "none",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                    >
                      GitHub →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Research & Writing Section */}
      <section style={{ marginBottom: "6rem" }}>
        <div
          data-anim="section-heading"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2.5rem",
            opacity: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            Research & Writing
          </h2>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
            }}
          >
            {WRITING.length} PIECE{WRITING.length > 1 ? "S" : ""}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {WRITING.map((piece) => (
            <div
              key={piece.slug}
              data-anim="card"
              data-cursor-hover
              className="relative"
              onClick={() => navigateTo(`/works/${piece.slug}`)}
              style={{
                padding: "2rem 2.5rem",
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "2px",
                opacity: 0,
                cursor: "pointer",
                transition: "border-color 0.3s ease, background 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(0,0,0,0.4)";
              }}
            >
              <div className="hud-corner hud-corner--tl" />
              <div className="hud-corner hud-corner--tr" />
              <div className="hud-corner hud-corner--bl" />
              <div className="hud-corner hud-corner--br" />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.35rem",
                      fontWeight: 300,
                      letterSpacing: "0.01em",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {piece.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.45)",
                      marginBottom: "1rem",
                      maxWidth: "48rem",
                    }}
                  >
                    {piece.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {piece.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.55rem",
                          letterSpacing: "0.08em",
                          color: "rgba(255,255,255,0.2)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "1px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.2)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {piece.date}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.55rem",
                      color: "rgba(255,255,255,0.15)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {piece.readTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
