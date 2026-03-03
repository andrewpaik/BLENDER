"use client";

/**
 * ScrollCanvas — Full-viewport canvas driven by shared Lenis scroll.
 *
 * Consumes the shared Lenis instance from LenisProvider and uses
 * the piecewise progressToFrame mapping to handle resistance zones
 * where the frame holds while content appears.
 */

import { useCallback, useEffect, useRef } from "react";
import { useLenis } from "@/lib/LenisProvider";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { progressToFrame, computeTotalHeightVh } from "@/lib/frameMapping";
import {
  scrollSections,
  FRAME_COUNT,
  VH_PER_FRAME,
  RUNWAY_PADDING_VH,
} from "@/lib/scrollConfig";
import { clamp } from "@/lib/mathUtils";

interface ScrollCanvasProps {
  frames: HTMLImageElement[];
  isLoaded: boolean;
}

const mappingConfig = {
  sections: scrollSections,
  frameCount: FRAME_COUNT,
  vhPerFrame: VH_PER_FRAME,
};

export function ScrollCanvas({ frames, isLoaded }: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastFrameValue = useRef(-1);
  const lenis = useLenis();
  const device = useDeviceDetect();

  /** Set canvas dimensions to fill viewport at capped DPR */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = device.current.maxDpr;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;
    }

    lastFrameValue.current = -1;
  }, [device]);

  /** Cover-fit helper — computes draw rect for an image */
  const coverFit = useCallback((img: HTMLImageElement) => {
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    return { x: (cw - drawW) / 2, y: (ch - drawH) / 2, w: drawW, h: drawH };
  }, []);

  /**
   * Draw a blended frame to the canvas.
   * fractionalFrame 30.6 → draws frame 30 at 40% and frame 31 at 60%.
   * When exactly on an integer, draws a single frame (no blend overhead).
   */
  const drawBlended = useCallback((fractionalFrame: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const lo = Math.floor(fractionalFrame);
    const hi = Math.min(lo + 1, frames.length - 1);
    const t = fractionalFrame - lo;

    const imgA = frames[lo];
    if (!imgA) return;

    ctx.clearRect(0, 0, cw, ch);

    // If on an exact frame or both frames are the same, draw once
    if (t < 0.005 || lo === hi) {
      const r = coverFit(imgA);
      ctx.drawImage(imgA, r.x, r.y, r.w, r.h);
      return;
    }

    const imgB = frames[hi];
    if (!imgB) {
      const r = coverFit(imgA);
      ctx.drawImage(imgA, r.x, r.y, r.w, r.h);
      return;
    }

    // Cross-fade: draw frame A, then overlay frame B with proportional alpha
    const rA = coverFit(imgA);
    ctx.globalAlpha = 1;
    ctx.drawImage(imgA, rA.x, rA.y, rA.w, rA.h);

    ctx.globalAlpha = t;
    const rB = coverFit(imgB);
    ctx.drawImage(imgB, rB.x, rB.y, rB.w, rB.h);

    ctx.globalAlpha = 1;
  }, [frames, coverFit]);

  useEffect(() => {
    if (!isLoaded || frames.length === 0 || !lenis) return;

    resizeCanvas();

    // Compute scroll fraction boundaries for the frame runway
    const totalVh = computeTotalHeightVh(mappingConfig, RUNWAY_PADDING_VH);
    const startFraction = RUNWAY_PADDING_VH / totalVh;
    const endFraction = 1 - (RUNWAY_PADDING_VH / totalVh);

    // On every Lenis tick, map smoothed progress to a fractional frame
    function onScroll() {
      const progress = lenis!.progress;

      // Remap global progress to the frame runway (exclude padding)
      const runwayProgress = clamp(
        (progress - startFraction) / (endFraction - startFraction),
        0,
        1,
      );

      // Piecewise mapping returns fractional frame (e.g. 30.6)
      const fractionalFrame = progressToFrame(runwayProgress, mappingConfig);

      // Redraw if the frame value changed enough to be visible
      if (Math.abs(fractionalFrame - lastFrameValue.current) > 0.001) {
        drawBlended(fractionalFrame);
        lastFrameValue.current = fractionalFrame;
      }
    }

    lenis.on("scroll", onScroll);

    // Debounced resize
    let resizeTimeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        onScroll();
      }, 150);
    }
    window.addEventListener("resize", onResize);

    // Draw first frame immediately
    drawBlended(0);

    return () => {
      lenis.off("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);
    };
  }, [isLoaded, frames, lenis, resizeCanvas, drawBlended]);

  return (
    <canvas
      ref={canvasRef}
      data-frame-canvas
      className="fixed inset-0 z-0"
      style={{ willChange: "transform" }}
    />
  );
}
