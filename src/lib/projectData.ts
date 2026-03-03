/**
 * projectData — Centralized project and writing data.
 *
 * Shared between the /works listing page and /works/[slug] detail pages.
 * Each item has a URL-safe slug for routing.
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  year: string;
  status: "Building" | "Complete";
  repo?: string;
  previewImage?: string;
  type: "project";
}

export interface Writing {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  date: string;
  readTime: string;
  previewImage?: string;
  type: "writing";
}

export type WorkItem = Project | Writing;

export const PROJECTS: Project[] = [
  {
    slug: "sprintiq",
    title: "SprintIQ",
    description:
      "AI-powered sprint biomechanical analysis using pose estimation and personalized coaching feedback.",
    longDescription:
      "Athletes record themselves via phone camera, MediaPipe Pose detects 33 body keypoints per frame on-device, and the backend computes 7 biomechanical metrics — trunk lean, shin angle, knee drive height, ground contact time, foot placement, triple extension, and stride progression. Each metric is classified into quality tiers with coaching feedback and corrective drill recommendations backed by sports science research.",
    tags: ["React Native", "FastAPI", "MediaPipe", "Python", "NumPy"],
    year: "2025",
    status: "Building",
    type: "project",
  },
  {
    slug: "project-sentinel",
    title: "Project Sentinel",
    description:
      "Autonomous threat detection — aerial object classification, anomaly flagging, and real-time geospatial intelligence.",
    longDescription:
      "An autonomous surveillance system combining aerial imagery classification with real-time anomaly detection. Uses YOLOv8 for object detection, DeepSORT for multi-object tracking across frames, and PostGIS for geospatial querying and zone-based alerting. Designed for scalable deployment with streaming video feeds.",
    tags: ["YOLOv8", "DeepSORT", "PostGIS", "Python"],
    year: "2025",
    status: "Building",
    type: "project",
  },
  {
    slug: "poker-gto-trainer",
    title: "Poker GTO Trainer",
    description:
      "Real-time poker training with AI-powered GTO strategy analysis and instant decision feedback.",
    longDescription:
      "An interactive training app that teaches game-theory-optimal poker strategy. Presents realistic scenarios, evaluates decisions against mathematically optimal play, and provides detailed game theory explanations. Features hand range visualization, equity calculations, bet sizing analysis, and progressive difficulty that adapts to skill development.",
    tags: ["React", "FastAPI", "WebSockets", "Python"],
    year: "2024",
    status: "Complete",
    repo: "https://github.com/andrewpaik/poker-gto-trainer",
    previewImage: `${BASE_PATH}/images/projects/poker.png`,
    type: "project",
  },
  {
    slug: "neighborhood",
    title: "Neighborhood",
    description:
      "Social community platform connecting locals through weekly missions and group activities.",
    longDescription:
      "Designed to counter digital isolation by prioritizing proximity-based connections. Encourages engagement through weekly missions and group activities. Features local event discovery, neighborhood discussion boards, skill-sharing networks, and collaborative projects — all built to foster genuine human-to-human interaction.",
    tags: ["Next.js", "Firebase", "Tailwind CSS", "TypeScript"],
    year: "2024",
    status: "Complete",
    repo: "https://github.com/andrewpaik/neighborhood",
    previewImage: `${BASE_PATH}/images/projects/neighborhood.png`,
    type: "project",
  },
  {
    slug: "data-analyst-agent",
    title: "Data Analyst Agent",
    description:
      "Autonomous AI system for end-to-end data analysis with auto-generated reports and visualizations.",
    longDescription:
      "Ingests raw datasets, automatically identifies patterns and anomalies, generates visualizations, and produces natural language reports summarizing key findings. Built with a modular architecture supporting various data formats and analysis techniques, from statistical testing to time-series decomposition.",
    tags: ["Python", "scikit-learn", "Pandas", "Matplotlib"],
    year: "2024",
    status: "Complete",
    repo: "https://github.com/andrewpaik/data-analyst-agent",
    previewImage: `${BASE_PATH}/images/projects/data-analyst.png`,
    type: "project",
  },
  {
    slug: "eye-tracking-app",
    title: "Eye Tracking App",
    description:
      "Desktop eye tracking with webcam-based gaze estimation, calibration, and heatmap visualization.",
    longDescription:
      "A desktop eye tracking application using webcam-based gaze estimation powered by MediaPipe. Features a calibration system for accurate tracking, real-time gaze point visualization, and heatmap generation for viewing pattern analysis. Built with Electron for cross-platform support, enabling accessibility research and UX analysis without specialized hardware.",
    tags: ["Electron", "JavaScript", "MediaPipe"],
    year: "2024",
    status: "Complete",
    repo: "https://github.com/andrewpaik/eye-tracking-app",
    previewImage: `${BASE_PATH}/images/projects/eye-tracking.png`,
    type: "project",
  },
];

export const WRITING: Writing[] = [
  {
    slug: "layerzero-investment-memo",
    title: "LayerZero (ZRO): Investment Memo",
    description:
      "A deep-dive investment memo on LayerZero — the omnichain interoperability protocol positioning itself as the TCP/IP of blockchains, backed by Citadel Securities, DTCC, ICE/NYSE, and ARK Invest.",
    longDescription:
      "A deep-dive investment memo on LayerZero — the omnichain interoperability protocol positioning itself as the TCP/IP of blockchains, backed by Citadel Securities, DTCC, ICE/NYSE, and ARK Invest. Covers the protocol architecture, the Zero L1 thesis, competitive landscape, tokenomics, institutional adoption signals, and risk factors. Explores how LayerZero's generic messaging layer enables seamless cross-chain communication without trusted intermediaries.",
    tags: ["LayerZero", "Interoperability", "Cross-Chain", "Institutional", "Tokenization"],
    date: "Feb 2026",
    readTime: "16 min",
    type: "writing",
  },
];

export const ALL_WORKS: WorkItem[] = [...PROJECTS, ...WRITING];

export function getWorkBySlug(slug: string): WorkItem | undefined {
  return ALL_WORKS.find((item) => item.slug === slug);
}
