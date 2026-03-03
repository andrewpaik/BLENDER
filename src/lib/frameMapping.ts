/**
 * frameMapping — Piecewise scroll-to-frame mapping with resistance zones.
 *
 * During free-scroll zones, scroll progress maps linearly to frame advancement.
 * During resistance zones, extra scroll distance passes but the frame stays
 * fixed at the section's hold frame.
 */

import type { ScrollSection } from "./scrollConfig";
import { clamp } from "./mathUtils";

export interface FrameMappingConfig {
  sections: ScrollSection[];
  frameCount: number;
  vhPerFrame: number;
}

/**
 * Given a normalized progress (0→1) across the frame runway
 * (already stripped of top/bottom padding), return a fractional
 * frame index (e.g. 30.6) for smooth inter-frame blending.
 */
export function progressToFrame(
  progress: number,
  config: FrameMappingConfig,
): number {
  const { sections, frameCount, vhPerFrame } = config;

  const freeScrollVh = frameCount * vhPerFrame;
  const resistanceVh = sections.reduce((sum, s) => sum + s.pinDuration, 0);
  const totalVh = freeScrollVh + resistanceVh;

  // Convert normalized progress to virtual scroll position in vh
  const scrollVh = progress * totalVh;

  const sorted = [...sections].sort((a, b) => a.startFrame - b.startFrame);

  let vhConsumed = 0;
  let framesAdvanced = 0;

  for (const section of sorted) {
    // Free-scroll vh to reach this section from current position
    const freeVhToSection = (section.startFrame - framesAdvanced) * vhPerFrame;

    // Still in a free-scroll zone before this section
    if (scrollVh <= vhConsumed + freeVhToSection) {
      const remainingVh = scrollVh - vhConsumed;
      framesAdvanced += remainingVh / vhPerFrame;
      return clamp(framesAdvanced, 0, frameCount - 1);
    }

    // Advance through free-scroll zone to the section start
    vhConsumed += freeVhToSection;
    framesAdvanced = section.startFrame;

    // Inside the resistance zone — frame holds
    if (scrollVh <= vhConsumed + section.pinDuration) {
      return clamp(section.startFrame, 0, frameCount - 1);
    }

    // Past the resistance zone
    vhConsumed += section.pinDuration;
  }

  // Past all sections — remaining free-scroll to end
  const remainingVh = scrollVh - vhConsumed;
  framesAdvanced += remainingVh / vhPerFrame;
  return clamp(framesAdvanced, 0, frameCount - 1);
}

/**
 * Compute total page height in vh, including frame runway,
 * resistance zones, and top/bottom padding.
 */
export function computeTotalHeightVh(
  config: FrameMappingConfig,
  runwayPaddingVh: number,
): number {
  const freeScrollVh = config.frameCount * config.vhPerFrame;
  const resistanceVh = config.sections.reduce((sum, s) => sum + s.pinDuration, 0);
  return runwayPaddingVh + freeScrollVh + resistanceVh + runwayPaddingVh;
}
