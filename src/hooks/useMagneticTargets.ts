/**
 * useMagneticTargets — Module-scoped registry of magnetic DOM elements.
 *
 * Interactive elements register themselves on mount. The cursor's rAF loop
 * queries `findClosestMagnetic()` each frame to compute attraction offset.
 * DOMRects are cached and refreshed on scroll/resize to avoid layout thrashing.
 */

interface MagneticTarget {
  el: HTMLElement;
  rect: DOMRect;
  radius: number;
  strength: number;
}

const targets = new Map<HTMLElement, MagneticTarget>();

/** Register an element as a magnetic target. Returns cleanup function. */
export function registerMagnetic(el: HTMLElement): () => void {
  const rect = el.getBoundingClientRect();
  targets.set(el, {
    el,
    rect,
    radius: parseFloat(el.dataset.magneticRadius ?? "120"),
    strength: parseFloat(el.dataset.magneticStrength ?? "0.35"),
  });
  return () => { targets.delete(el); };
}

/** Recalculate cached rects for all registered elements. */
export function refreshMagneticRects(): void {
  for (const [, t] of targets) {
    t.rect = t.el.getBoundingClientRect();
  }
}

/** Find the closest magnetic target within range and return the pull offset. */
export function findClosestMagnetic(
  mouseX: number,
  mouseY: number,
): { offsetX: number; offsetY: number; element: HTMLElement } | null {
  let closest: MagneticTarget | null = null;
  let closestDist = Infinity;

  for (const [, t] of targets) {
    const cx = t.rect.left + t.rect.width / 2;
    const cy = t.rect.top + t.rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < t.radius && dist < closestDist) {
      closest = t;
      closestDist = dist;
    }
  }

  if (!closest) return null;

  const cx = closest.rect.left + closest.rect.width / 2;
  const cy = closest.rect.top + closest.rect.height / 2;
  const dx = mouseX - cx;
  const dy = mouseY - cy;

  // Smoothstep falloff — stronger pull closer to center
  const pull = 1 - closestDist / closest.radius;
  const smooth = pull * pull * (3 - 2 * pull);

  return {
    offsetX: -dx * smooth * closest.strength,
    offsetY: -dy * smooth * closest.strength,
    element: closest.el,
  };
}
