"use client";

import { ProjectDetail } from "@/components/ProjectDetail";
import { usePageTransition } from "@/components/PageTransition";
import type { WorkItem } from "@/lib/projectData";

export function WorkDetailClient({ work }: { work: WorkItem | null }) {
  const { navigateTo } = usePageTransition();

  if (!work) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Project not found
        </p>
        <button
          data-cursor-hover
          onClick={() => navigateTo("/works")}
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
          }}
        >
          ← Back to Works
        </button>
      </main>
    );
  }

  return <ProjectDetail work={work} />;
}
