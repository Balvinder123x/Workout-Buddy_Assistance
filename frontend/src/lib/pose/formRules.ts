/**
 * Form feedback rule engine.
 *
 * IMPORTANT: this is deterministic geometry, NOT machine learning. Each rule
 * fires from a measurable joint angle or position and explains exactly why. We
 * do this rather than a trained "fault classifier" because there is no honest
 * labeled dataset for named form faults — and because explainable rules are
 * more useful to a user (and more defensible) than an opaque prediction.
 *
 * The ML model (Phase 6) answers "which exercise". This answers "how well".
 */
import { angle } from "@/lib/pose/angles";
import { LM, type Landmark, type PoseFrame } from "@/lib/pose/types";

export type FormSeverity = "good" | "warn" | "bad";

export interface FormCue {
  id: string;
  message: string;
  severity: FormSeverity;
}

function avg(a: number, b: number): number {
  return (a + b) / 2;
}

/** Torso lean from vertical: 0 = upright, larger = more forward lean. */
function torsoLeanDegrees(f: PoseFrame): number {
  const shoulder: Landmark = {
    x: avg(f[LM.LEFT_SHOULDER].x, f[LM.RIGHT_SHOULDER].x),
    y: avg(f[LM.LEFT_SHOULDER].y, f[LM.RIGHT_SHOULDER].y),
    z: 0,
    visibility: 1,
  };
  const hip: Landmark = {
    x: avg(f[LM.LEFT_HIP].x, f[LM.RIGHT_HIP].x),
    y: avg(f[LM.LEFT_HIP].y, f[LM.RIGHT_HIP].y),
    z: 0,
    visibility: 1,
  };
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  // Angle of the torso vector away from vertical (up = negative y).
  return Math.abs((Math.atan2(dx, -dy) * 180) / Math.PI);
}

/**
 * Evaluate all form rules for an exercise against one frame. Returns the cues
 * that fired (may be empty when form looks good).
 */
export function evaluateForm(
  exerciseId: string,
  f: PoseFrame,
): FormCue[] {
  const cues: FormCue[] = [];

  const kneeL = angle(f[LM.LEFT_HIP], f[LM.LEFT_KNEE], f[LM.LEFT_ANKLE]);
  const kneeR = angle(f[LM.RIGHT_HIP], f[LM.RIGHT_KNEE], f[LM.RIGHT_ANKLE]);
  const elbowL = angle(f[LM.LEFT_SHOULDER], f[LM.LEFT_ELBOW], f[LM.LEFT_WRIST]);
  const elbowR = angle(
    f[LM.RIGHT_SHOULDER],
    f[LM.RIGHT_ELBOW],
    f[LM.RIGHT_WRIST],
  );
  const lean = torsoLeanDegrees(f);

  switch (exerciseId) {
    case "squat": {
      const knee = avg(kneeL, kneeR);
      // Knee-over-toe: knee x passes the ankle x noticeably.
      const kneeOverToeL = f[LM.LEFT_KNEE].x - f[LM.LEFT_ANKLE].x;
      const kneeOverToeR = f[LM.RIGHT_ANKLE].x - f[LM.RIGHT_KNEE].x;
      if (Math.abs(kneeOverToeL) > 0.08 || Math.abs(kneeOverToeR) > 0.08) {
        cues.push({
          id: "knee-over-toe",
          message: "Keep your knees behind your toes",
          severity: "warn",
        });
      }
      if (lean > 45) {
        cues.push({
          id: "torso-lean",
          message: "Chest up — you're leaning too far forward",
          severity: "warn",
        });
      }
      // Depth is judged at the bottom; only flag when clearly shallow mid-rep.
      if (knee > 150) {
        cues.push({
          id: "shallow",
          message: "Go deeper for full range of motion",
          severity: "warn",
        });
      }
      break;
    }
    case "pushup": {
      if (lean > 18) {
        cues.push({
          id: "hips-sag",
          message: "Keep your body in a straight line",
          severity: "warn",
        });
      }
      // Elbow flare: elbows far outside the shoulders.
      const flareL = f[LM.LEFT_ELBOW].x - f[LM.LEFT_SHOULDER].x;
      const flareR = f[LM.RIGHT_SHOULDER].x - f[LM.RIGHT_ELBOW].x;
      if (flareL < -0.1 || flareR < -0.1) {
        cues.push({
          id: "elbow-flare",
          message: "Tuck your elbows closer to your body",
          severity: "warn",
        });
      }
      break;
    }
    case "curl": {
      // Swinging: torso should stay upright during a curl.
      if (lean > 15) {
        cues.push({
          id: "swing",
          message: "Stop swinging — keep your torso still",
          severity: "warn",
        });
      }
      break;
    }
    case "shoulder-press": {
      const elbow = avg(elbowL, elbowR);
      if (lean > 15) {
        cues.push({
          id: "back-arch",
          message: "Brace your core — don't arch your back",
          severity: "warn",
        });
      }
      if (elbow < 150 && elbow > 120) {
        cues.push({
          id: "partial-lockout",
          message: "Press all the way to full extension",
          severity: "warn",
        });
      }
      break;
    }
    case "lunge": {
      // Front knee (whichever is more bent) shouldn't collapse past toe.
      const frontKneeOverToe =
        f[LM.RIGHT_KNEE].x - f[LM.RIGHT_ANKLE].x;
      if (Math.abs(frontKneeOverToe) > 0.1) {
        cues.push({
          id: "knee-over-toe",
          message: "Keep your front knee above your ankle",
          severity: "warn",
        });
      }
      if (lean > 25) {
        cues.push({
          id: "torso-lean",
          message: "Stay upright through the lunge",
          severity: "warn",
        });
      }
      break;
    }
    default:
      break;
  }

  return cues;
}
