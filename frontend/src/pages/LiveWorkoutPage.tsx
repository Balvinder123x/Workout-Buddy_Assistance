import { motion } from "framer-motion";
import {
  Camera,
  Check,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CameraView } from "@/components/vision/CameraView";
import { DetectedExercise } from "@/components/vision/DetectedExercise";
import { FormCues } from "@/components/vision/FormCues";
import { PoseStatsHud } from "@/components/vision/PoseStatsHud";
import { Badge } from "@/components/ui/Badge";
import { type Exercise, exercises } from "@/data/exercises";
import { usePoseCamera } from "@/lib/pose/usePoseCamera";
import { isSpeechSupported } from "@/lib/pose/voice";

export function LiveWorkoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const exerciseId = params.get("exercise");
  const exercise: Exercise =
    exercises.find((e) => e.id === exerciseId) ?? exercises[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const {
    status,
    error,
    stats,
    start,
    pause,
    resume,
    resetReps,
    finalizeScore,
    stop,
  } = usePoseCamera({
    videoRef,
    canvasRef,
    exerciseId: exercise.id,
    voiceEnabled,
  });

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Session timer runs whenever the camera is actively tracking.
  useEffect(() => {
    if (status === "running") {
      timerRef.current = window.setInterval(
        () => setElapsed((e) => e + 1),
        1000,
      );
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [status]);

  const finish = useCallback(() => {
    const score = finalizeScore();
    stop();
    // Pass the rich score object to the summary via sessionStorage.
    sessionStorage.setItem(
      "swb_last_score",
      JSON.stringify({ exerciseId: exercise.id, reps: stats.reps, seconds: elapsed, score }),
    );
    navigate(
      `/workout/summary?exercise=${exercise.id}&reps=${stats.reps}&seconds=${elapsed}`,
    );
  }, [finalizeScore, stop, navigate, exercise.id, stats.reps, elapsed]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, []);

  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  const repProgress = Math.min(stats.reps / exercise.targetReps, 1);
  const isTracked = exercise.mlSupported;

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-cream">
              {exercise.name}
            </h1>
            {isTracked && <Badge tone="violet">AI-tracked</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {exercise.muscleGroup} · target {exercise.targetReps} reps
          </p>
        </div>
        <div className="flex gap-2">
          {isSpeechSupported() && (
            <button
              onClick={() => setVoiceEnabled((v) => !v)}
              aria-label="Toggle voice feedback"
              aria-pressed={voiceEnabled}
              className={`btn-ghost flex items-center gap-2 text-sm ${
                voiceEnabled ? "text-cyan-400" : ""
              }`}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <Maximize className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              stop();
              navigate("/workout");
            }}
            className="btn-ghost text-sm"
          >
            Exit
          </button>
        </div>
      </div>

      {isTracked ? (
        <>
          <PoseStatsHud stats={stats} />
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <CameraView
              videoRef={videoRef}
              canvasRef={canvasRef}
              status={status}
              error={error}
              onStart={start}
            />

            <div className="space-y-4">
              <DetectedExercise
                detected={stats.detected}
                confidence={stats.detectedConfidence}
                selectedId={exercise.id}
              />
              <FormCues cues={stats.cues} />
              <div className="glass rounded-2xl p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Time
                </p>
                <p className="mt-2 font-display text-5xl font-bold text-cream">
                  {minutes}:{seconds}
                </p>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Reps
                  </p>
                  <p className="font-display text-sm text-slate-400">
                    {stats.reps} / {exercise.targetReps}
                  </p>
                </div>
                <p className="mt-2 font-display text-6xl font-bold text-cyan-400">
                  {stats.reps}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-motion-gradient"
                    animate={{ width: `${repProgress * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Counted from joint angles — go to full depth for the rep to
                  register.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Timer-based fallback for exercises without pose tracking. */
        <div className="glass flex aspect-video items-center justify-center rounded-2xl">
          <div className="text-center">
            <Camera className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">
              {exercise.name} is a timer-based exercise.
            </p>
            <p className="mt-2 font-display text-5xl font-bold text-cream">
              {minutes}:{seconds}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="glass flex flex-wrap items-center justify-center gap-3 rounded-2xl p-4">
        {status === "running" ? (
          <button
            onClick={pause}
            className="btn-primary flex items-center gap-2"
          >
            <Pause className="h-4 w-4" /> Pause
          </button>
        ) : (
          <button
            onClick={status === "paused" ? resume : start}
            className="btn-primary flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {status === "paused" ? "Resume" : "Start"}
          </button>
        )}
        <button
          onClick={() => {
            resetReps();
            setElapsed(0);
          }}
          className="btn-ghost flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        <button
          onClick={finish}
          className="ml-auto flex items-center gap-2 rounded-xl bg-emerald-500/90 px-5 py-2.5 font-medium text-ink-950 transition hover:bg-emerald-400"
        >
          <Check className="h-4 w-4" /> Finish
        </button>
      </div>
    </div>
  );
}
