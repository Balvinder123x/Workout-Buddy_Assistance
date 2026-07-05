import * as ort from "onnxruntime-web";

import { CLASSES, type ExerciseClass, extractFeatures } from "@/lib/pose/features";
import type { Landmark } from "@/lib/pose/types";

// Load the ONNX runtime WASM binaries from CDN rather than bundling the ~11 MB
// files into the app. Keeps the repo and build lean.
ort.env.wasm.wasmPaths =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/";

const MODEL_URL = "/models/exercise_classifier.onnx";

let sessionPromise: Promise<ort.InferenceSession> | null = null;

function getSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(MODEL_URL).catch((err) => {
      sessionPromise = null;
      throw err;
    });
  }
  return sessionPromise;
}

export interface Classification {
  label: ExerciseClass;
  confidence: number;
}

/**
 * Classify a pose frame into one of the five exercises using the ONNX model.
 * Returns the top label and its probability. Runs fully in the browser.
 */
export async function classifyPose(
  frame: Landmark[],
): Promise<Classification | null> {
  const session = await getSession();
  const features = extractFeatures(frame);
  const input = new ort.Tensor("float32", features, [1, features.length]);

  const feeds: Record<string, ort.Tensor> = {};
  feeds[session.inputNames[0]] = input;
  const output = await session.run(feeds);

  // The exported pipeline outputs "label" and "probabilities".
  const probsTensor =
    output["probabilities"] ?? output[session.outputNames[1]];
  if (!probsTensor) return null;

  const probs = probsTensor.data as Float32Array;
  let bestIdx = 0;
  let bestProb = -Infinity;
  for (let i = 0; i < probs.length; i++) {
    if (probs[i] > bestProb) {
      bestProb = probs[i];
      bestIdx = i;
    }
  }

  return { label: CLASSES[bestIdx], confidence: bestProb };
}

/** Warm the model so the first live classification isn't slow. */
export function preloadClassifier(): void {
  void getSession();
}
