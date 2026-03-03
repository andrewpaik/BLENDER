"use client";

/**
 * Main page — mounts the scroll-driven cinematic experience.
 *
 * Phase 2: Scroll runway is built from segments (free-scroll + resistance).
 * Resistance segments double as ScrollTrigger trigger elements.
 */

import { ScrollCanvas } from "@/components/ScrollCanvas";
import { WebGLLayer } from "@/components/WebGLLayer";
import { Particles } from "@/components/Particles";
import { ScrollSections } from "@/components/ScrollSections";
import { CustomCursor } from "@/components/CustomCursor";
import { TableOfContents } from "@/components/TableOfContents";
import { Loader } from "@/components/Loader";
import { LenisProvider } from "@/lib/LenisProvider";
import { useFrameSequence } from "@/hooks/useFrameSequence";
import { scrollSections, RUNWAY_PADDING_VH } from "@/lib/scrollConfig";
import { buildScrollSegments } from "@/lib/scrollSegments";

const segments = buildScrollSegments(scrollSections, RUNWAY_PADDING_VH);

export default function Home() {
  const { frames, progress, isLoaded } = useFrameSequence();

  return (
    <LenisProvider>
      <Loader progress={progress} isLoaded={isLoaded} />
      <ScrollCanvas frames={frames} isLoaded={isLoaded} />
      {isLoaded && <Particles />}
      {isLoaded && <WebGLLayer />}
      <ScrollSections />
      <TableOfContents />
      <CustomCursor />

      {/* Scroll runway: sequence of free-scroll and resistance segments */}
      {segments.map((seg, i) => {
        if (seg.type === "resistance") {
          return (
            <div
              key={`resistance-${seg.section.id}`}
              data-marker={seg.section.id}
              style={{ height: `${seg.heightVh}vh` }}
              aria-hidden="true"
            />
          );
        }
        return (
          <div
            key={`segment-${i}`}
            style={{ height: `${seg.heightVh}vh` }}
            aria-hidden="true"
          />
        );
      })}
    </LenisProvider>
  );
}
