/**
 * scrollConfig — Central scroll section definitions.
 *
 * Each section defines a frame where the video pauses
 * (resistance zone) and content appears. The video plays
 * freely between sections.
 */

export type SectionPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "center-top"
  | "center"
  | "bottom-center";

export interface ProjectItem {
  title: string;
  description: string;
  tags: string[];
}

export interface ContactLink {
  platform: string;
  handle: string;
  href: string;
}

export interface ScrollSection {
  id: string;
  /** Frame index where the video holds during this section */
  startFrame: number;
  /** Reserved for Phase 3 (subtle frame drift during hold) */
  endFrame: number;
  /** Viewport-heights of scroll distance while pinned */
  pinDuration: number;
  /** Display label for the section */
  label: string;
  /** Optional subtitle / body text */
  subtitle?: string;
  /** Where the content appears on screen */
  position: SectionPosition;
  /** Project cards for showcase section */
  projects?: ProjectItem[];
  /** Contact links for closing section */
  contacts?: ContactLink[];
}

/** Total number of frames in the sequence */
export const FRAME_COUNT = 150;

/** Viewport-heights of scroll per frame in free-scroll zones */
export const VH_PER_FRAME = 5;

/** Extra scroll runway at top/bottom for Lenis acceleration/deceleration */
export const RUNWAY_PADDING_VH = 150;

/** Scroll sections — frame numbers are adjustable to match video content */
export const scrollSections: ScrollSection[] = [
  {
    id: "hero",
    startFrame: 0,
    endFrame: 0,
    pinDuration: 200,
    label: "Andrew Paik",
    position: "center-top",
  },
  {
    id: "intro",
    startFrame: 30,
    endFrame: 30,
    pinDuration: 200,
    label: "About Me",
    subtitle:
      "I'm a student at USC studying Business Administration and Data Science. I specialize in AI-driven web development and autonomous agent systems — building tools that think, adapt, and act. I'm equally drawn to decentralized finance, designing blockchain applications where architecture and incentive design intersect. I find meaning in structure, in intricate systems, and in the craft of building something that feels considered from the inside out.",
    position: "top-center",
  },
  {
    id: "showcase",
    startFrame: 80,
    endFrame: 80,
    pinDuration: 250,
    label: "Selected Work",
    position: "top-left",
    projects: [
      {
        title: "SprintIQ",
        description: "AI biomechanical analysis for sprinters using pose estimation and real-time coaching feedback.",
        tags: ["Computer Vision", "MediaPipe", "FastAPI"],
      },
      {
        title: "Project Sentinel",
        description: "Autonomous threat detection system — aerial object classification, anomaly flagging, and real-time geospatial intelligence.",
        tags: ["YOLOv8", "DeepSORT", "PostGIS"],
      },
      {
        title: "Poker GTO Trainer",
        description: "Interactive training app teaching game-theory-optimal poker strategy with real-time decision analysis.",
        tags: ["React", "WebSockets", "Python"],
      },
      {
        title: "LayerZero Research",
        description: "Investment memo on LayerZero's omnichain interoperability protocol and the Zero L1 thesis.",
        tags: ["DeFi", "Cross-Chain", "Research"],
      },
    ],
  },
  {
    id: "closing",
    startFrame: 149,
    endFrame: 149,
    pinDuration: 200,
    label: "Get In Touch",
    subtitle: "Los Angeles, CA",
    position: "center",
    contacts: [
      {
        platform: "GitHub",
        handle: "andrewpaik",
        href: "https://github.com/andrewpaik",
      },
      {
        platform: "LinkedIn",
        handle: "andrew-paik",
        href: "https://www.linkedin.com/in/andrew-paik-9b78882b3/",
      },
    ],
  },
];

/** Base path prefix — set by NEXT_PUBLIC_BASE_PATH for GitHub Pages */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Path pattern for frame images — 1-indexed, zero-padded to 4 digits */
export function framePath(index: number): string {
  const padded = String(index + 1).padStart(4, "0");
  return `${BASE_PATH}/frames/frame-${padded}.jpg`;
}
