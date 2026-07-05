/**
 * Pose landmark types and skeleton connections.
 *
 * MediaPipe Pose returns 33 landmarks. We keep our own thin types so the rest
 * of the app doesn't depend directly on MediaPipe's shapes, which makes the
 * detector swappable later.
 */

export interface Landmark {
  x: number; // normalized 0-1 (relative to image width)
  y: number; // normalized 0-1 (relative to image height)
  z: number; // depth, roughly normalized to hip width
  visibility: number; // 0-1 confidence the point is visible
}

export type PoseFrame = Landmark[]; // length 33 when a pose is detected

/** Index constants for the landmarks we use in angle math. */
export const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

/**
 * Pairs of landmark indices that form the skeleton lines we draw. A trimmed
 * version of MediaPipe's POSE_CONNECTIONS covering torso and limbs.
 */
export const POSE_CONNECTIONS: Array<[number, number]> = [
  // Arms
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  // Shoulders + torso
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  // Legs
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];
