#!/bin/bash

# Extract frames from video at full 4K resolution (3840px), all frames
# Output: High-quality JPEG (q:v 2 = near-lossless)
# Post-process: Convert to WebP via cwebp if available, for smaller payload
#
# Usage: ./scripts/extract-frames.sh [input-video] [output-dir]
#   Default input: Videos/0001-0150.mp4
#   Default output: public/frames/

set -euo pipefail

INPUT="${1:-Videos/0001-0150.mp4}"
OUTPUT_DIR="${2:-public/frames}"

if [ ! -f "$INPUT" ]; then
  echo "Error: Input video not found at $INPUT"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Extracting frames from: $INPUT"
echo "Output directory: $OUTPUT_DIR"
echo "Resolution: 3840px wide (full 4K)"
echo "Format: JPEG (q:v 2 — near-lossless)"
echo ""

ffmpeg -y -i "$INPUT" \
  -vf "scale=3840:-1" \
  -q:v 2 \
  "$OUTPUT_DIR/frame-%04d.jpg"

# Convert to WebP if cwebp is available (25-35% smaller files)
if command -v cwebp &>/dev/null; then
  echo ""
  echo "cwebp found — converting to WebP for smaller payload..."
  for f in "$OUTPUT_DIR"/frame-*.jpg; do
    base=$(basename "$f" .jpg)
    cwebp -q 85 "$f" -o "$OUTPUT_DIR/${base}.webp" 2>/dev/null
    rm "$f"
  done
  EXT="webp"
else
  echo ""
  echo "Note: cwebp not found. Keeping frames as JPEG."
  echo "Install with 'brew install webp' for 25-35% smaller files."
  EXT="jpg"
fi

FRAME_COUNT=$(ls -1 "$OUTPUT_DIR"/frame-*."$EXT" 2>/dev/null | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)

echo ""
echo "Done! Extracted $FRAME_COUNT frames ($EXT)"
echo "Total size: $TOTAL_SIZE"
echo ""
echo "Update FRAME_COUNT and framePath in src/lib/scrollConfig.ts if needed."
