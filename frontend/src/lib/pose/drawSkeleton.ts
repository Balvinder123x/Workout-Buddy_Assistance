/**
 * Draws the pose skeleton onto a canvas overlay. Coordinates are normalized
 * (0-1), so we scale by the canvas size. Kept as a pure drawing function.
 */
import { type Landmark, POSE_CONNECTIONS } from "@/lib/pose/types";

const VIOLET = "#8b5cf6";
const CYAN = "#22d3ee";

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  frame: Landmark[] | null,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  if (!frame) return;

  // Connections
  ctx.lineWidth = 3;
  ctx.strokeStyle = VIOLET;
  for (const [a, b] of POSE_CONNECTIONS) {
    const pa = frame[a];
    const pb = frame[b];
    if (!pa || !pb) continue;
    if (pa.visibility < 0.4 || pb.visibility < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * width, pa.y * height);
    ctx.lineTo(pb.x * width, pb.y * height);
    ctx.stroke();
  }

  // Joints
  ctx.fillStyle = CYAN;
  for (const lm of frame) {
    if (lm.visibility < 0.4) continue;
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
