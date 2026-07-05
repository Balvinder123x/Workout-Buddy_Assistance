/**
 * Joint-angle geometry and rep counting.
 *
 * Rep counting here is deterministic geometry, NOT machine learning: for each
 * supported exercise we track a joint angle and count a rep when it crosses a
 * "down" threshold and then returns past an "up" threshold. This is honest and
 * explainable. (Exercise *classification* — deciding which exercise it is — is
 * the ML model in Phase 6; here the exercise is already known.)
 */
import { LM, type Landmark, type PoseFrame } from "@/lib/pose/types";

/** Angle at point b formed by a-b-c, in degrees (0-180). */
export function angle(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magAb = Math.hypot(abx, aby);
  const magCb = Math.hypot(cbx, cby);
  if (magAb === 0 || magCb === 0) return 180;
  const cos = Math.min(1, Math.max(-1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Average of left/right joint angles, skipping low-visibility sides. */
function symmetricAngle(
  frame: PoseFrame,
  left: [number, number, number],
  right: [number, number, number],
): number | null {
  const sides: number[] = [];
  for (const [a, b, c] of [left, right]) {
    const pa = frame[a];
    const pb = frame[b];
    const pc = frame[c];
    if (
      pa?.visibility > 0.5 &&
      pb?.visibility > 0.5 &&
      pc?.visibility > 0.5
    ) {
      sides.push(angle(pa, pb, pc));
    }
  }
  if (sides.length === 0) return null;
  return sides.reduce((s, v) => s + v, 0) / sides.length;
}

/** The tracked angle for each supported exercise. */
export function trackedAngle(
  exerciseId: string,
  frame: PoseFrame,
): number | null {
  switch (exerciseId) {
    case "squat":
    case "lunge":
      // Knee angle (hip-knee-ankle).
      return symmetricAngle(
        frame,
        [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
        [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
      );
    case "pushup":
    case "curl":
      // Elbow angle (shoulder-elbow-wrist).
      return symmetricAngle(
        frame,
        [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST],
        [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
      );
    case "shoulder-press":
      // Elbow angle again, but the "up" position is the extended one.
      return symmetricAngle(
        frame,
        [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST],
        [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
      );
    default:
      return null;
  }
}

/**
 * Per-exercise thresholds. `downBelow`: angle drops below this to enter the
 * bottom of the rep. `upAbove`: angle rises above this to complete the rep.
 */
interface RepThresholds {
  downBelow: number;
  upAbove: number;
}

const THRESHOLDS: Record<string, RepThresholds> = {
  squat: { downBelow: 100, upAbove: 160 },
  lunge: { downBelow: 110, upAbove: 160 },
  pushup: { downBelow: 90, upAbove: 160 },
  curl: { downBelow: 60, upAbove: 150 },
  "shoulder-press": { downBelow: 90, upAbove: 160 },
};

export type RepPhase = "up" | "down";

export interface RepState {
  count: number;
  phase: RepPhase;
}

export function initialRepState(): RepState {
  return { count: 0, phase: "up" };
}

/**
 * Advance the rep state machine with the current tracked angle. Returns the
 * (possibly updated) state. A rep is counted on the down→up transition.
 */
export function updateReps(
  exerciseId: string,
  currentAngle: number | null,
  state: RepState,
): RepState {
  const t = THRESHOLDS[exerciseId];
  if (!t || currentAngle === null) return state;

  if (state.phase === "up" && currentAngle < t.downBelow) {
    return { count: state.count, phase: "down" };
  }
  if (state.phase === "down" && currentAngle > t.upAbove) {
    return { count: state.count + 1, phase: "up" };
  }
  return state;
}
