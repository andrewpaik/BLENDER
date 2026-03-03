/**
 * frameLoader — Batch preload frame images with progress callback.
 * Loads frames in parallel batches to maximize throughput
 * without overwhelming the browser's connection pool.
 */

const DEFAULT_BATCH_SIZE = 20;

interface FrameLoaderOptions {
  frameCount: number;
  pathPattern: (index: number) => string;
  batchSize?: number;
  onProgress?: (loaded: number, total: number) => void;
}

export async function loadFrames({
  frameCount,
  pathPattern,
  batchSize = DEFAULT_BATCH_SIZE,
  onProgress,
}: FrameLoaderOptions): Promise<HTMLImageElement[]> {
  const frames: HTMLImageElement[] = new Array(frameCount);
  let loaded = 0;

  for (let i = 0; i < frameCount; i += batchSize) {
    const batchEnd = Math.min(i + batchSize, frameCount);
    const batchPromises: Promise<void>[] = [];

    for (let j = i; j < batchEnd; j++) {
      batchPromises.push(
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            frames[j] = img;
            loaded++;
            onProgress?.(loaded, frameCount);
            resolve();
          };
          img.onerror = () => reject(new Error(`Failed to load frame ${j}`));
          img.src = pathPattern(j);
        })
      );
    }

    await Promise.all(batchPromises);
  }

  return frames;
}
