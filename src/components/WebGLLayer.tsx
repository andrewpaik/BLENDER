"use client";

/**
 * WebGLLayer — Phase 3 cinematic post-processing.
 *
 * A separate Three.js canvas layered over the frame canvas.
 * Reads the frame canvas as a CanvasTexture and applies:
 * - Chromatic aberration (scroll-velocity-reactive)
 * - Vignette (darken edges)
 * - Film grain (animated noise)
 *
 * Renders on a SEPARATE canvas from the frame painter (per CLAUDE.md rules).
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uScrollVelocity;
  varying vec2 vUv;

  // Film grain noise
  float grain(vec2 uv, float t) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233)) + t) * 43758.5453);
  }

  // Chromatic aberration — offset R and B from G
  vec3 chromaticAberration(sampler2D tex, vec2 uv, float intensity) {
    float r = texture2D(tex, uv + vec2(intensity, 0.0)).r;
    float g = texture2D(tex, uv).g;
    float b = texture2D(tex, uv - vec2(intensity, 0.0)).b;
    return vec3(r, g, b);
  }

  void main() {
    // Chromatic aberration scales with scroll velocity
    float aberration = uScrollVelocity * 0.003;
    vec3 color = chromaticAberration(uTexture, vUv, aberration);

    // Vignette — darken edges
    float dist = distance(vUv, vec2(0.5));
    color *= smoothstep(0.8, 0.3, dist);

    // Film grain — subtle animated noise
    float g = grain(vUv * 1000.0, uTime) * 0.05;
    color += g;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Simplified shader for tablets — vignette only, no chromatic aberration or grain */
const FRAGMENT_SHADER_LITE = `
  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    vec3 color = texture2D(uTexture, vUv).rgb;

    // Vignette only
    float dist = distance(vUv, vec2(0.5));
    color *= smoothstep(0.8, 0.3, dist);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function WebGLLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollVelocity = useScrollVelocity();
  const device = useDeviceDetect();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Skip WebGL entirely on phones — raw frame canvas is fine on small screens
    if (device.current.isMobile) return;

    const frameCanvas = document.querySelector(
      "[data-frame-canvas]",
    ) as HTMLCanvasElement | null;
    if (!frameCanvas) return;

    const isTouch = device.current.isTouch;

    // Three.js setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: isTouch ? "default" : "high-performance",
    });
    renderer.setPixelRatio(device.current.maxDpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const texture = new THREE.CanvasTexture(frameCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Tablets get vignette-only shader; desktop gets full pipeline
    const uniforms: Record<string, THREE.IUniform> = {
      uTexture: { value: texture },
    };
    if (!isTouch) {
      uniforms.uTime = { value: 0 };
      uniforms.uScrollVelocity = { value: 0 };
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: isTouch ? FRAGMENT_SHADER_LITE : FRAGMENT_SHADER,
      transparent: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    let raf: number;
    function animate() {
      if (!isTouch) {
        material.uniforms.uTime.value = clock.getElapsedTime();
        material.uniforms.uScrollVelocity.value = scrollVelocity.current;
      }

      texture.needsUpdate = true;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        renderer.setPixelRatio(device.current.maxDpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 150);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);

      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollVelocity, device]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[5]"
      style={{ pointerEvents: "none" }}
    />
  );
}
