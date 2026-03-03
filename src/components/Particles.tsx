"use client";

/**
 * Particles — Ambient floating particles in the background.
 * Subtle, slow-moving dots that add depth and atmosphere.
 * Uses Canvas 2D for performance (no Three.js overhead).
 */

import { useEffect, useRef } from "react";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";

const PARTICLE_COUNT_DESKTOP = 80;
const PARTICLE_COUNT_MOBILE = 30;
const MAX_SIZE = 2.5;
const MIN_SIZE = 0.8;
const MAX_SPEED = 0.2;
const OPACITY = 0.45;
const PARALLAX_RANGE = 25; // Max px shift for largest particles

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  depth: number; // 0→1, larger particles = more parallax shift
  fill: string; // Pre-computed fillStyle to avoid string allocation per frame
}

function createParticle(w: number, h: number): Particle {
  const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
  const opacity = (0.3 + Math.random() * 0.7) * OPACITY;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size,
    speedX: (Math.random() - 0.5) * MAX_SPEED,
    speedY: (Math.random() - 0.5) * MAX_SPEED,
    opacity,
    depth: (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE),
    fill: `rgba(255, 255, 255, ${opacity})`,
  };
}

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallax = useMouseParallax();
  const device = useDeviceDetect();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isTouch = device.current.isTouch;
    const particleCount = isTouch ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = device.current.maxDpr;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = Array.from(
      { length: particleCount },
      () => createParticle(w, h),
    );

    let raf: number;

    function animate() {
      ctx!.clearRect(0, 0, w, h);

      // Skip mouse parallax on touch — no mouse movement to track
      const mx = isTouch ? 0 : parallax.current.x;
      const my = isTouch ? 0 : parallax.current.y;

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        // Depth-weighted parallax: larger (closer) particles shift more
        const px = p.x + mx * PARALLAX_RANGE * p.depth;
        const py = p.y + my * PARALLAX_RANGE * p.depth;

        ctx!.beginPath();
        ctx!.arc(px, py, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.fill;
        ctx!.fill();
      }

      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);

    // Resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        w = window.innerWidth;
        h = window.innerHeight;
        const currentDpr = device.current.maxDpr;
        canvas!.width = w * currentDpr;
        canvas!.height = h * currentDpr;
        ctx!.setTransform(1, 0, 0, 1, 0, 0);
        ctx!.scale(currentDpr, currentDpr);
      }, 150);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);
    };
  }, [parallax, device]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[8]"
      style={{
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
