/**
 * scrollSegments — Builds an ordered list of scroll segments
 * for DOM rendering. Free-scroll segments advance frames;
 * resistance segments hold the frame while content appears.
 * Resistance segment divs double as ScrollTrigger triggers.
 */

import type { ScrollSection } from "./scrollConfig";
import { FRAME_COUNT, VH_PER_FRAME } from "./scrollConfig";

export type ScrollSegment =
  | { type: "padding"; heightVh: number }
  | { type: "freeScroll"; startFrame: number; endFrame: number; heightVh: number }
  | { type: "resistance"; section: ScrollSection; heightVh: number };

export function buildScrollSegments(
  sections: ScrollSection[],
  paddingVh: number,
): ScrollSegment[] {
  const sorted = [...sections].sort((a, b) => a.startFrame - b.startFrame);
  const segments: ScrollSegment[] = [];

  segments.push({ type: "padding", heightVh: paddingVh });

  let currentFrame = 0;

  for (const section of sorted) {
    // Free-scroll zone from currentFrame to section's hold frame
    if (section.startFrame > currentFrame) {
      const frames = section.startFrame - currentFrame;
      segments.push({
        type: "freeScroll",
        startFrame: currentFrame,
        endFrame: section.startFrame,
        heightVh: frames * VH_PER_FRAME,
      });
    }

    // Resistance zone
    segments.push({
      type: "resistance",
      section,
      heightVh: section.pinDuration,
    });

    currentFrame = section.startFrame;
  }

  // Final free-scroll zone from last section to end
  if (currentFrame < FRAME_COUNT - 1) {
    const frames = (FRAME_COUNT - 1) - currentFrame;
    segments.push({
      type: "freeScroll",
      startFrame: currentFrame,
      endFrame: FRAME_COUNT - 1,
      heightVh: frames * VH_PER_FRAME,
    });
  }

  segments.push({ type: "padding", heightVh: paddingVh });

  return segments;
}
