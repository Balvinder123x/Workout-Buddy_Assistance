/**
 * Feature extraction for the exercise classifier.
 *
 * This MUST stay in exact parity with the Python `ml/src/features.py`, because
 * the model was trained on features produced there. The 14 features and their
 * order are frozen. If you change one side, change both and retrain.
 */
import { type Landmark, LM } from "@/lib/pose/types";

export const CLASSES = [
  "squat",
  "pushup",
  "curl",
  "shoulder-press",
  "lunge",
] as const;

export type ExerciseClass = (typeof CLASSES)[number];

export const N_FEATURES = 14;

function angle(a: Landmark, b: Landmark, c: Landmark): number {
  const bax = a.x - b.x;
  const bay = a.y - b.y;
  const bcx = c.x - b.x;
  const bcy = c.y - b.y;
  const denom = Math.hypot(bax, bay) * Math.hypot(bcx, bcy) + 1e-8;
  const cos = Math.min(1, Math.max(-1, (bax * bcx + bay * bcy) / denom));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Produce the 14-feature vector from a 33-landmark frame, matching
 * features.py exactly (same order, same math).
 */
export function extractFeatures(lm: Landmark[]): Float32Array {
  const elbowL = angle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_ELBOW], lm[LM.LEFT_WRIST]);
  const elbowR = angle(
    lm[LM.RIGHT_SHOULDER],
    lm[LM.RIGHT_ELBOW],
    lm[LM.RIGHT_WRIST],
  );
  const shoulderL = angle(lm[LM.LEFT_ELBOW], lm[LM.LEFT_SHOULDER], lm[LM.LEFT_HIP]);
  const shoulderR = angle(
    lm[LM.RIGHT_ELBOW],
    lm[LM.RIGHT_SHOULDER],
    lm[LM.RIGHT_HIP],
  );
  const hipL = angle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE]);
  const hipR = angle(lm[LM.RIGHT_SHOULDER], lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE]);
  const kneeL = angle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
  const kneeR = angle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);

  const hipY = (lm[LM.LEFT_HIP].y + lm[LM.RIGHT_HIP].y) / 2;
  const shoulderY = (lm[LM.LEFT_SHOULDER].y + lm[LM.RIGHT_SHOULDER].y) / 2;

  const wristHL = hipY - lm[LM.LEFT_WRIST].y;
  const wristHR = hipY - lm[LM.RIGHT_WRIST].y;
  const ankleHL = hipY - lm[LM.LEFT_ANKLE].y;
  const ankleHR = hipY - lm[LM.RIGHT_ANKLE].y;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < 33; i++) {
    const p = lm[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const width = maxX - minX + 1e-6;
  const height = maxY - minY + 1e-6;
  const postureAspect = height / width;
  const torsoRatio = Math.abs(shoulderY - hipY) / height;

  return new Float32Array([
    elbowL,
    elbowR,
    shoulderL,
    shoulderR,
    hipL,
    hipR,
    kneeL,
    kneeR,
    wristHL,
    wristHR,
    ankleHL,
    ankleHR,
    postureAspect,
    torsoRatio,
  ]);
}
