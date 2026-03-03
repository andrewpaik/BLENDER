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
  const lastDrawnFrame = useRef(-1);
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

    lastDrawnFrame.current = -1;
  }, [device]);

  /** Draw a frame to the canvas, cover-fit */
  const drawFrame = useCallback((frameIndex: number) => {
    const ctx = ctxRef.current;
    const img = frames[frameIndex];
    if (!ctx || !img) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, [frames]);

  useEffect(() => {
    if (!isLoaded || frames.length === 0 || !lenis) return;

    resizeCanvas();

    // Compute scroll fraction boundaries for the frame runway
    const totalVh = computeTotalHeightVh(mappingConfig, RUNWAY_PADDING_VH);
    const startFraction = RUNWAY_PADDING_VH / totalVh;
    const endFraction = 1 - (RUNWAY_PADDING_VH / totalVh);

    // On every Lenis tick, map smoothed progress to a frame
    function onScroll() {
      const progress = lenis!.progress;

      // Remap global progress to the frame runway (exclude padding)
      const runwayProgress = clamp(
        (progress - startFraction) / (endFraction - startFraction),
        0,
        1,
      );

      // Piecewise mapping handles resistance zones
      const frameIndex = progressToFrame(runwayProgress, mappingConfig);

      if (frameIndex !== lastDrawnFrame.current) {
        drawFrame(frameIndex);
        lastDrawnFrame.current = frameIndex;
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
    drawFrame(0);

    return () => {
      lenis.off("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);
    };
  }, [isLoaded, frames, lenis, resizeCanvas, drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      data-frame-canvas
      className="fixed inset-0 z-0"
      style={{ willChange: "transform" }}
    />
  );
}
