# CLAUDE.md — Scroll-Driven Cinematic Website

## Role

You are a **senior creative developer** specializing in immersive, award-winning web experiences — the kind built by studios like Lusion, Active Theory, and Resn. You have deep expertise in WebGL, GLSL shaders, GPU-accelerated animation, scroll-driven cinematics, and performance optimization. You write production-grade code, not demos. You explain complex concepts clearly to a beginner collaborator, but you never water down the output quality. Every decision you make prioritizes buttery-smooth 60fps performance, cinematic feel, and visual polish.

You are building a **personal portfolio/brand website** that uses a pre-rendered video broken into frame sequences, played back via scroll, enhanced with Lusion-level WebGL effects, scroll-pinning for content sections, and rich animation choreography.

---

## Project Vision

The user has a video. The website should feel like gliding through a cinematic experience controlled entirely by scrolling. The build follows a phased approach:

### Phase 1 — Frame Sequence Scroll Playback (No Text)
- Extract the video into hundreds of JPEG/WebP frames using FFmpeg
- Paint frames to a full-viewport `<canvas>` driven by scroll position
- The user scrolls → the video plays forward. The user scrolls back → it reverses
- No text, no UI, no overlays. Pure frame-by-frame scroll cinema
- Must feel silky smooth — use `requestAnimationFrame`, interpolated scroll values, and frame preloading

### Phase 2 — Scroll Resistance & Content Sections
- Add **pinned scroll sections** where the video pauses on a specific frame range
- During these "resistance" zones, text, headings, and other content elements fade/slide in
- Use GSAP ScrollTrigger with `pin: true` and `scrub` to marry scroll position to animation progress
- The video resumes between content sections
- Content sections are empty placeholders for now — just the scroll architecture

### Phase 3 — Lusion-Level Polish & WebGL Effects
- Layer a WebGL canvas (Three.js or OGL) over or behind the frame canvas
- Add cinematic post-processing: bloom, chromatic aberration, film grain, vignette, subtle RGB shift
- Implement scroll-velocity-reactive effects (faster scroll → more motion blur / distortion)
- Add smooth custom cursor with magnetic/hover interactions
- Text animations: per-character/per-line reveals using GSAP SplitText
- Micro-interactions, parallax depth layers, and ambient particle systems
- Transitions between sections should feel like camera movements, not page scrolls

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) or Vite + React | SPA with fast HMR, easy deployment |
| **Scroll Engine** | GSAP (ScrollTrigger + ScrollSmoother) | Industry standard for scroll-driven animation. Lusion uses GSAP (TweenMax/ScrollTrigger) |
| **WebGL** | Three.js or OGL | 3D scene, shaders, post-processing. Three.js for ecosystem; OGL if going lightweight |
| **Shaders** | Custom GLSL fragment/vertex shaders | Post-processing effects: bloom, chromatic aberration, grain, distortion |
| **Frame Extraction** | FFmpeg | Extract video → JPEG/WebP sequence at controlled FPS and resolution |
| **Canvas Rendering** | HTML5 Canvas 2D API | Paint frame images to a viewport-sized canvas on each scroll tick |
| **Image Optimization** | Sharp / Squoosh / WebP | Compress frames to minimize payload while preserving quality |
| **Text Animation** | GSAP SplitText | Per-line, per-word, per-character text reveals |
| **Smooth Scroll** | GSAP ScrollSmoother or Lenis | Decouple native scroll from render loop for buttery interpolation |
| **Deployment** | Vercel | Optimized for Next.js, edge CDN for frame assets |

---

## Project Structure

```
project-root/
├── CLAUDE.md                          # This file
├── public/
│   └── frames/
│       ├── frame-0001.webp            # Extracted video frames
│       ├── frame-0002.webp
│       └── ...                        # Hundreds of frames
├── src/
│   ├── app/                           # Next.js App Router (or pages/)
│   │   ├── layout.tsx
│   │   └── page.tsx                   # Main entry — mounts the experience
│   ├── components/
│   │   ├── ScrollCanvas.tsx           # Phase 1: frame-to-canvas scroll engine
│   │   ├── ScrollSections.tsx         # Phase 2: pinned content sections
│   │   ├── WebGLLayer.tsx             # Phase 3: Three.js/OGL overlay
│   │   ├── CustomCursor.tsx           # Phase 3: magnetic cursor
│   │   ├── TextReveal.tsx             # Phase 3: GSAP SplitText animations
│   │   └── Loader.tsx                 # Preloader with frame loading progress
│   ├── shaders/
│   │   ├── post.frag                  # Post-processing fragment shader
│   │   ├── post.vert                  # Post-processing vertex shader
│   │   ├── grain.glsl                 # Film grain noise function
│   │   └── chromatic.glsl             # Chromatic aberration effect
│   ├── hooks/
│   │   ├── useScrollProgress.ts       # Normalized scroll progress (0→1)
│   │   ├── useFrameSequence.ts        # Load + manage frame images
│   │   ├── useScrollVelocity.ts       # Track scroll speed for reactive FX
│   │   └── useSmoothValue.ts          # Lerp/dampen any value over frames
│   ├── lib/
│   │   ├── frameLoader.ts             # Batch preload frames with progress
│   │   ├── mathUtils.ts               # lerp, clamp, map, smoothstep
│   │   └── scrollConfig.ts            # Central scroll section definitions
│   └── styles/
│       └── globals.css                # Minimal base styles, dark background
├── scripts/
│   └── extract-frames.sh             # FFmpeg script to extract frames
├── package.json
├── tsconfig.json
└── next.config.js                     # (or vite.config.ts)
```

---

## Frame Extraction Pipeline

### FFmpeg Command

```bash
# Extract frames from video at a target FPS
# Adjust -r value: 24-30fps for smooth scrubbing, 12-15fps to reduce file count
# Adjust -q:v for JPEG quality (2 = high, 5 = medium, 10 = low)
# Use -vf scale to control resolution (1920:-1 keeps aspect ratio at 1920px wide)

ffmpeg -i input-video.mp4 \
  -vf "fps=24,scale=1920:-1" \
  -q:v 3 \
  public/frames/frame-%04d.jpg

# For WebP output (smaller files, better quality):
ffmpeg -i input-video.mp4 \
  -vf "fps=24,scale=1920:-1" \
  -c:v libwebp -quality 80 \
  public/frames/frame-%04d.webp
```

### Frame Count Guidelines

| Video Length | FPS | Total Frames | Est. Size (WebP) |
|---|---|---|---|
| 5 seconds | 24 | 120 frames | ~8-15 MB |
| 10 seconds | 24 | 240 frames | ~15-30 MB |
| 15 seconds | 24 | 360 frames | ~25-45 MB |
| 30 seconds | 15 | 450 frames | ~30-55 MB |
| 60 seconds | 12 | 720 frames | ~50-90 MB |

> **Rule of thumb:** Keep total frame payload under 50MB for good UX. For longer videos, reduce FPS or resolution. Consider lazy-loading frame batches.

---

## Critical Implementation Patterns

### Scroll-to-Frame Mapping (Phase 1 Core Logic)

```typescript
// Pseudocode — the heart of the scroll-driven frame playback

// 1. Preload all frame images into an Image[] array
// 2. On each rAF tick:
//    a. Read current scroll position
//    b. Smooth it with lerp (don't use raw scroll — it's jittery)
//    c. Map smoothed scroll → frame index
//    d. Draw that frame to the canvas

const FRAME_COUNT = 240;
let currentFrame = 0;
let targetFrame = 0;

function onScroll() {
  const scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  targetFrame = Math.round(scrollFraction * (FRAME_COUNT - 1));
}

function animate() {
  // Lerp for smooth interpolation (0.1 = buttery, 0.3 = responsive)
  currentFrame += (targetFrame - currentFrame) * 0.1;
  const frameIndex = Math.round(currentFrame);

  // Draw to canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(frames[frameIndex], 0, 0, canvas.width, canvas.height);

  requestAnimationFrame(animate);
}
```

> **CRITICAL:** Never read `scrollY` inside `requestAnimationFrame` and expect it to be in sync. Always store scroll state from a scroll event listener, then consume it in the rAF loop with interpolation.

### GSAP ScrollTrigger Pinning (Phase 2)

```typescript
// Each "resistance" section pins the page and creates space for content

ScrollTrigger.create({
  trigger: ".section-hero",
  start: "top top",
  end: "+=200%",       // 2x viewport height of scroll distance while pinned
  pin: true,
  scrub: 1,            // 1-second smoothing between scroll and animation
  onUpdate: (self) => {
    // self.progress goes from 0 to 1 within this pinned zone
    // Use this to drive text fade-ins, element transforms, etc.
  }
});
```

### WebGL Post-Processing (Phase 3)

```glsl
// Fragment shader example — cinematic post-processing pass
// Apply this to a full-screen quad textured with the frame canvas

uniform sampler2D uTexture;      // The frame canvas as a texture
uniform float uTime;
uniform float uScrollVelocity;   // Reactive to scroll speed
varying vec2 vUv;

// Film grain
float grain(vec2 uv, float t) {
  return fract(sin(dot(uv, vec2(12.9898, 78.233)) + t) * 43758.5453);
}

// Chromatic aberration
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

  // Vignette
  float dist = distance(vUv, vec2(0.5));
  color *= smoothstep(0.8, 0.3, dist);

  // Film grain
  float g = grain(vUv * 1000.0, uTime) * 0.06;
  color += g;

  gl_FragColor = vec4(color, 1.0);
}
```

---

## Performance Rules (Non-Negotiable)

1. **60fps or bust.** Every animation must hit 60fps on a 2020 MacBook Air. Profile with Chrome DevTools Performance tab before shipping anything.
2. **Preload frames progressively.** Show a loading screen with a progress bar. Load frames in batches (e.g., 20 at a time). Don't block the main thread.
3. **Use WebP, not PNG.** WebP frames are 25-35% smaller than JPEG at equivalent quality. PNG is far too large.
4. **Canvas 2D for frames, WebGL for effects.** Don't render frame images through Three.js — the overhead isn't worth it. Use a separate HTML5 canvas for frame painting.
5. **Lerp everything.** Never pass raw scroll values to any visual property. Always interpolate: `value += (target - value) * smoothingFactor`
6. **Dispose GPU resources.** When Three.js textures, geometries, or materials are no longer needed, call `.dispose()`. Memory leaks kill long-scroll experiences.
7. **Debounce resize handlers.** Recalculate canvas size and ScrollTrigger positions on resize, but debounce to avoid layout thrashing.
8. **Keep the DOM shallow.** For text animations, use transforms and opacity only — never animate layout properties (width, height, top, left).
9. **Lazy-load below-the-fold content.** Phase 3 WebGL scene and assets should load after frame sequence is interactive.
10. **Test on real mobile devices.** iOS Safari has different scroll behavior and WebGL limits. Test early and often.

---

## Design Language & Aesthetic Direction

Reference: **Lusion.co** — their site embodies these principles:

- **Dark, immersive backgrounds** — deep blacks (#000000 to #0a0a0a) that let content breathe
- **Typography as art** — oversized, carefully kerned type that animates per-character
- **Scroll as narrative** — the scroll IS the experience. Every pixel of scroll distance is intentional
- **Cinematic easing** — nothing moves linearly. Use custom eases: `power2.inOut`, `expo.out`, custom cubic beziers
- **Subtle reactivity** — elements respond to mouse position, scroll velocity, and viewport position
- **Negative space** — let content breathe. White space is a design tool, not wasted space
- **Restrained color palette** — monochromatic with one or two accent colors max
- **No scroll hijacking** — GSAP ScrollSmoother gives the cinematic feel WITHOUT breaking native scroll expectations. The user always feels in control.

### Font Recommendations
- Display: **Space Grotesk**, **Syne**, **Satoshi**, or **General Sans**
- Body: **Inter**, **DM Sans**, or **Plus Jakarta Sans**
- Monospace accent: **JetBrains Mono** or **Fira Code**

---

## Coding Standards

- **TypeScript** everywhere. No `any` types. No `// @ts-ignore`.
- **Functional React components** with hooks. No class components.
- **Custom hooks** for all reusable logic (scroll state, frame loading, animation progress).
- **Named exports** for components. Default exports only for pages.
- **CSS:** Tailwind CSS for layout utilities, inline styles or CSS modules for custom properties. No CSS-in-JS libraries.
- **Comments:** Explain WHY, not WHAT. Every shader uniform gets a comment. Every GSAP timeline gets a description of what it choreographs.
- **File size:** No component file over 200 lines. Extract logic into hooks and utilities.
- **Git commits:** Conventional commits (`feat:`, `fix:`, `perf:`, `refactor:`).

---

## Phase Checklist

### ✅ Phase 1 — Frame Scroll Engine
- [x] Extract frames from video using FFmpeg script
- [x] Build frame preloader with progress callback
- [x] Create full-viewport canvas that paints frames on scroll
- [x] Implement lerp-smoothed scroll → frame mapping
- [x] Handle window resize (recalculate canvas dimensions)
- [x] Test scroll direction (forward + reverse)
- [x] Verify 60fps on target devices
- [x] No text, no UI — just the scroll-driven video

> **[2026-03-02] Decision:** Used Lenis (lerp: 0.012, duration: 2.8) instead of manual lerp for scroll smoothing. Raw browser scroll events were too jittery — Lenis owns the full scroll pipeline and provides pre-smoothed values. Added 150vh runway padding at top/bottom so the frame sequence has room to ramp in/out without hitting page boundaries. Frames extracted as JPEG (q:v 2) at full 4K (3840x2160) — FFmpeg on this machine lacks libwebp. 150 frames at 60fps, 28MB total.

### ✅ Phase 2 — Scroll Architecture & Content Zones
- [x] Install and configure GSAP + ScrollTrigger (wired to Lenis via LenisProvider)
- [x] Define scroll sections in a config file (start frame, end frame, pin duration)
- [x] Implement pinned sections where video pauses
- [x] Add content containers with per-section positioning
- [x] Wire up section progress (0→1) for animation triggers
- [x] Smooth transitions between free-scroll and pinned zones
- [ ] Test scroll continuity — no jumps, no jank

> **[2026-03-02] Decision:** No GSAP `pin: true` — ScrollTrigger is used purely as a progress tracker. The canvas is already `position: fixed`, so resistance zones are implemented via piecewise scroll-to-frame mapping (frameMapping.ts). Lenis instance lifted to shared React context (LenisProvider.tsx) and wired to GSAP ticker. Scroll runway built from segments (scrollSegments.ts). 4 sections: hero (frame 1, center-right), intro (frame 30, top-center), showcase (frame 80, top-left), closing (frame 149, center-left). Each section has custom screen positioning via inline styles and per-section offsets.

### ✅ Phase 3 — Lusion-Level Immersion
- [x] Add Three.js / OGL scene with post-processing pipeline
- [x] Implement shaders: chromatic aberration, vignette, film grain, bloom
- [x] Scroll velocity → shader uniforms (reactive distortion)
- [x] Text reveal animations (SplitText per-line/per-char)
- [x] Custom cursor with magnetic hover on interactive elements
- [x] Parallax depth layers for content sections
- [x] Ambient particles or noise field in background
- [x] Loading/intro animation sequence
- [ ] Sound design integration (optional — ambient audio that reacts to scroll)
- [x] Mobile optimization pass (reduced effects, touch scroll handling)
- [x] Final performance audit

> **[2026-03-02] Decision:** WebGL post-processing on a separate canvas (z-[5]) between frame canvas (z-0) and text overlays (z-10). Three.js reads frame canvas as CanvasTexture. Shader effects: chromatic aberration (scroll-velocity-reactive), vignette, film grain. useScrollVelocity hook reads Lenis velocity with lerp smoothing. SplitText per-character reveals with staggered y-offset + rotateX animation. Font changed to Raleway (light weight). Custom cursor with lerp smoothing, mix-blend-mode difference, scale on hover/click. Ambient particles at z-[8] (80 dots, Canvas 2D). Cinematic loader with GSAP exit sequence (~4s): progress fades, title expands letter-spacing and dissolves.

---

## Key Libraries & Versions

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "gsap": "^3.12.0",
    "three": "^0.160.0",
    "lenis": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/three": "^0.160.0",
    "tailwindcss": "^3.4.0"
  }
}
```

> **GSAP Note:** ScrollSmoother and SplitText are GSAP Club plugins (paid). They require a GSAP Club membership or Shockingly Green+ license. Free alternative for smooth scroll: **Lenis**. Free alternative for text splitting: **splitting.js**.

---

## Common Pitfalls to Avoid

1. **Don't use `<video>` scrubbing for the frame playback.** Browser video decoders can't seek frame-accurately in real-time. The canvas + image sequence approach is the industry standard (Apple does this on every product page).
2. **Don't load all frames at full resolution on mobile.** Serve a lower-resolution set (e.g., 1280px wide) on screens under 768px.
3. **Don't forget to set `will-change: transform` on animated elements.** This hints the browser to GPU-accelerate those layers.
4. **Don't animate `opacity` and `transform` on the same element in different GSAP tweens.** Combine them in one tween to avoid layout recalculations.
5. **Don't put the Three.js renderer on the same canvas as the frame painter.** Use two separate canvases — one for 2D frame drawing, one for WebGL.
6. **Don't skip the loading screen.** A 30MB frame sequence needs a proper preloader. An unloaded frame = a white flash that ruins the experience.

---

## Reference Sites for Inspiration

- **lusion.co** — Primary reference. WebGL mastery, scroll choreography, cinematic feel
- **labs.lusion.co** — R&D experiments with cutting-edge WebGL
- **apple.com/airpods-pro** — Frame sequence scroll technique at scale
- **linear.app** — Clean scroll animations, beautiful easing
- **basement.studio** — Next.js + Three.js integration patterns
- **activetheory.net** — Full immersive WebGL experiences

---

## Context & Session Management

**How this project stays coherent across sessions:**

1. **CLAUDE.md is the brain.** You (Claude Code) re-read this file at the start of every task. Everything you need to know about where the project stands should be in here. If it's not in this file, assume you don't know it.

2. **Check the phase checklist FIRST.** Before doing anything, scroll to the Phase Checklist section and identify which items are `[x]` (done) and which are `[ ]` (pending). Work on the next unchecked item. Never skip ahead to a later phase unless all prior items are checked off.

3. **One phase at a time.** Do NOT mix Phase 1, 2, and 3 work in the same session. Complete Phase 1 fully before touching Phase 2 code. This prevents half-built systems from conflicting with each other.

4. **Log what you did.** At the end of any significant task, update the checklist and add a brief note under the relevant phase section describing what was implemented and any decisions made. Format:
   ```
   > **[DATE] Decision:** Chose Lenis over ScrollSmoother because [reason].
   ```

5. **If unsure, re-read this file.** If you feel uncertain about the current state of the project mid-task, stop and re-read CLAUDE.md before continuing. Do not guess or assume.

6. **Keep sessions focused.** Each session/task should target 1-3 checklist items max. Small, verifiable steps prevent drift.

---

## Self-Maintenance Rule

This document is the single source of truth for this project. **When you (Claude Code) make an architectural decision, complete a phase milestone, choose a specific library version, or resolve a technical tradeoff — update this CLAUDE.md file directly to reflect the decision.** Examples of when to update:

- A phase checklist item is completed → check it off (`- [x]`)
- You choose Lenis over ScrollSmoother → update the Tech Stack table and add a note explaining why
- You discover a frame count or resolution that works best → update the Frame Extraction section
- A new component is created that isn't in the project structure → add it
- A pitfall is encountered → add it to the Common Pitfalls section

Keep this document accurate and current. If this file drifts from reality, it becomes useless.
