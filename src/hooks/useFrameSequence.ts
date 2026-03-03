"use client";

/**
 * useFrameSequence — Loads a sequence of frame images and
 * exposes them along with loading progress. Uses batch loading
 * to avoid blocking the main thread.
 */

import { useEffect, useRef, useState } from "react";
import { loadFrames } from "@/lib/frameLoader";
import { FRAME_COUNT, framePath } from "@/lib/scrollConfig";

interface FrameSequenceState {
  frames: HTMLImageElement[];
  progress: number;
  isLoaded: boolean;
}

export function useFrameSequence(): FrameSequenceState {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const framesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadFrames({
      frameCount: FRAME_COUNT,
      pathPattern: framePath,
      batchSize: 20,
      onProgress: (loaded, total) => {
        if (!cancelled) {
          setProgress(loaded / total);
        }
      },
    }).then((loaded) => {
      if (!cancelled) {
        framesRef.current = loaded;
        setIsLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { frames: framesRef.current, progress, isLoaded };
}
