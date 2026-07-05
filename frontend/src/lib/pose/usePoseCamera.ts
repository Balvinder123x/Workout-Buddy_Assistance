import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import { initialRepState, type RepState, trackedAngle, updateReps } from "@/lib/pose/angles";
import { classifyPose, preloadClassifier } from "@/lib/pose/classifier";
import { drawSkeleton } from "@/lib/pose/drawSkeleton";
import type { ExerciseClass } from "@/lib/pose/features";
import { type FormCue } from "@/lib/pose/formRules";
import { getPoseLandmarker, toDetectionResult } from "@/lib/pose/landmarker";
import { angle as angleBetween } from "@/lib/pose/angles";
import { type QualityScore, scoreSet } from "@/lib/pose/quality";
import { RepAccumulator } from "@/lib/pose/repAccumulator";
import { LM, type PoseFrame } from "@/lib/pose/types";
import { speak } from "@/lib/pose/voice";

export type CameraStatus =
  | "idle"
  | "loading"
  | "running"
  | "paused"
  | "error";

export interface PoseStats {
  fps: number;
  inferenceMs: number;
  confidence: number;
  reps: number;
  angle: number | null;
  detected: ExerciseClass | null;
  detectedConfidence: number;
  cues: FormCue[];
}

interface UsePoseCameraArgs {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  exerciseId: string;
  voiceEnabled?: boolean;
}

/** Left/right tracked-joint angle difference (degrees) for symmetry scoring. */
function computeSymmetry(exerciseId: string, f: PoseFrame): number {
  let left: number;
  let right: number;
  if (exerciseId === "squat" || exerciseId === "lunge") {
    left = angleBetween(f[LM.LEFT_HIP], f[LM.LEFT_KNEE], f[LM.LEFT_ANKLE]);
    right = angleBetween(f[LM.RIGHT_HIP], f[LM.RIGHT_KNEE], f[LM.RIGHT_ANKLE]);
  } else {
    left = angleBetween(
      f[LM.LEFT_SHOULDER],
      f[LM.LEFT_ELBOW],
      f[LM.LEFT_WRIST],
    );
    right = angleBetween(
      f[LM.RIGHT_SHOULDER],
      f[LM.RIGHT_ELBOW],
      f[LM.RIGHT_WRIST],
    );
  }
  return Math.abs(left - right);
}

/**
 * Manages the webcam + MediaPipe detection loop and exposes live stats.
 *
 * The detection loop is driven by requestAnimationFrame. All state that the
 * loop mutates every frame is held in refs to avoid re-render churn; only the
 * throttled stats snapshot is pushed to React state (~10x/sec).
 */
export function usePoseCamera({
  videoRef,
  canvasRef,
  exerciseId,
  voiceEnabled = false,
}: UsePoseCameraArgs) {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PoseStats>({
    fps: 0,
    inferenceMs: 0,
    confidence: 0,
    reps: 0,
    angle: null,
    detected: null,
    detectedConfidence: 0,
    cues: [],
  });
  const [score, setScore] = useState<QualityScore | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const repStateRef = useRef<RepState>(initialRepState());
  const lastVideoTimeRef = useRef(-1);
  const accumulatorRef = useRef<RepAccumulator>(
    new RepAccumulator(exerciseId),
  );
  const voiceEnabledRef = useRef(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  // FPS bookkeeping
  const frameTimesRef = useRef<number[]>([]);
  const lastStatsPushRef = useRef(0);

  // Classification bookkeeping (runs periodically, not every frame).
  const detectedRef = useRef<ExerciseClass | null>(null);
  const detectedConfRef = useRef(0);
  const lastClassifyRef = useRef(0);
  const classifyingRef = useRef(false);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const detectFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !runningRef.current) return;

    // Only run inference when the video has advanced to a new frame.
    if (video.currentTime !== lastVideoTimeRef.current && video.videoWidth > 0) {
      lastVideoTimeRef.current = video.currentTime;
      try {
        const landmarker = await getPoseLandmarker();
        const t0 = performance.now();
        const result = landmarker.detectForVideo(video, t0);
        const inferenceMs = performance.now() - t0;

        const { frame, confidence } = toDetectionResult(result);

        // Sync canvas size to the displayed video and draw the skeleton.
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) drawSkeleton(ctx, frame, canvas.width, canvas.height);

        // Rep counting via joint-angle state machine.
        const ang = frame ? trackedAngle(exerciseId, frame as PoseFrame) : null;
        const prevCount = repStateRef.current.count;
        repStateRef.current = updateReps(
          exerciseId,
          ang,
          repStateRef.current,
        );
        const repCompleted = repStateRef.current.count > prevCount;

        // Feed the quality accumulator (form cues + per-rep records).
        const nowTs = performance.now();
        if (frame) {
          // Symmetry: difference between left and right tracked joint angles.
          const symmetry = computeSymmetry(exerciseId, frame as PoseFrame);
          accumulatorRef.current.push(
            frame as PoseFrame,
            ang,
            symmetry,
            repStateRef.current.phase,
            repCompleted,
            nowTs,
          );
          // Speak the most severe current cue (throttled inside speak()).
          const cues = accumulatorRef.current.getCues();
          if (cues.length > 0) {
            speak(cues[0].message, voiceEnabledRef.current);
          }
        }

        // Periodic exercise classification (every ~500ms, non-blocking).
        const now = performance.now();
        if (
          frame &&
          now - lastClassifyRef.current > 500 &&
          !classifyingRef.current
        ) {
          lastClassifyRef.current = now;
          classifyingRef.current = true;
          void classifyPose(frame as PoseFrame)
            .then((res) => {
              if (res) {
                detectedRef.current = res.label;
                detectedConfRef.current = res.confidence;
              }
            })
            .catch(() => {
              /* classification is best-effort; ignore failures */
            })
            .finally(() => {
              classifyingRef.current = false;
            });
        }

        // FPS from a rolling window of frame timestamps.
        const times = frameTimesRef.current;
        times.push(now);
        while (times.length > 0 && now - times[0] > 1000) times.shift();
        const fps = times.length;

        // Throttle React state updates to ~10/sec.
        if (now - lastStatsPushRef.current > 100) {
          lastStatsPushRef.current = now;
          setStats({
            fps,
            inferenceMs,
            confidence,
            reps: repStateRef.current.count,
            angle: ang,
            detected: detectedRef.current,
            detectedConfidence: detectedConfRef.current,
            cues: accumulatorRef.current.getCues(),
          });
        }
      } catch (err) {
        stopLoop();
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Pose detection failed",
        );
        return;
      }
    }

    rafRef.current = requestAnimationFrame(detectFrame);
  }, [videoRef, canvasRef, exerciseId, stopLoop]);

  const start = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      // Warm the model before requesting the camera for a snappier start.
      await getPoseLandmarker();
      preloadClassifier();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Video element not ready");
      video.srcObject = stream;
      await video.play();

      runningRef.current = true;
      setStatus("running");
      rafRef.current = requestAnimationFrame(detectFrame);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Could not access the camera",
      );
    }
  }, [videoRef, detectFrame]);

  const pause = useCallback(() => {
    stopLoop();
    setStatus("paused");
  }, [stopLoop]);

  const resume = useCallback(() => {
    if (!streamRef.current) return;
    runningRef.current = true;
    setStatus("running");
    rafRef.current = requestAnimationFrame(detectFrame);
  }, [detectFrame]);

  const resetReps = useCallback(() => {
    repStateRef.current = initialRepState();
    accumulatorRef.current.reset();
    setScore(null);
    setStats((s) => ({ ...s, reps: 0, cues: [] }));
  }, []);

  /** Compute and store the final quality score for the completed set. */
  const finalizeScore = useCallback((): QualityScore => {
    const result = scoreSet(exerciseId, accumulatorRef.current.getRecords());
    setScore(result);
    return result;
  }, [exerciseId]);

  const stop = useCallback(() => {
    stopLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStatus("idle");
  }, [stopLoop]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      stopLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [stopLoop]);

  return {
    status,
    error,
    stats,
    score,
    start,
    pause,
    resume,
    resetReps,
    finalizeScore,
    stop,
  };
}
