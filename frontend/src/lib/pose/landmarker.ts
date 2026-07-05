/**
 * Thin wrapper around MediaPipe Tasks Vision PoseLandmarker.
 *
 * All inference runs in the browser via WASM — no frames leave the device.
 * The WASM runtime and model are fetched from Google's CDN on first use.
 */
import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

import type { PoseFrame } from "@/lib/pose/types";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

async function createLandmarker(): Promise<PoseLandmarker> {
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
  return PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

/** Lazily create (once) and return the shared landmarker instance. */
export function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = createLandmarker().catch((err) => {
      // Reset so a later retry can attempt creation again.
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}

export interface DetectionResult {
  frame: PoseFrame | null;
  /** Mean visibility across landmarks, used as an overall confidence read. */
  confidence: number;
}

/** Convert MediaPipe's result into our thin PoseFrame + a confidence read. */
export function toDetectionResult(
  result: PoseLandmarkerResult,
): DetectionResult {
  const landmarks = result.landmarks?.[0];
  if (!landmarks || landmarks.length === 0) {
    return { frame: null, confidence: 0 };
  }
  const frame: PoseFrame = landmarks.map((l) => ({
    x: l.x,
    y: l.y,
    z: l.z,
    visibility: l.visibility ?? 0,
  }));
  const confidence =
    frame.reduce((sum, l) => sum + l.visibility, 0) / frame.length;
  return { frame, confidence };
}
