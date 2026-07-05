import { motion } from "framer-motion";
import {
  Clock,
  Flame,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { QualityScoreCard } from "@/components/vision/QualityScoreCard";
import { useToast } from "@/components/feedback/Toast";
import { type Exercise, exercises } from "@/data/exercises";
import type { QualityScore } from "@/lib/pose/quality";
import { workoutApi } from "@/lib/workoutApi";

interface StoredScore {
  exerciseId: string;
  reps: number;
  seconds: number;
  score: QualityScore;
}

function readStoredScore(exerciseId: string): QualityScore | null {
  try {
    const raw = sessionStorage.getItem("swb_last_score");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredScore;
    return parsed.exerciseId === exerciseId ? parsed.score : null;
  } catch {
    return null;
  }
}

interface StatProps {
  icon: typeof Clock;
  label: string;
  value: string;
  accent: string;
}

function Stat({ icon: Icon, label, value, accent }: StatProps) {
  return (
    <div className="glass rounded-2xl p-5 text-center">
      <Icon className={`mx-auto h-6 w-6 ${accent}`} />
      <p className="mt-3 font-display text-2xl font-bold text-cream">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function WorkoutSummaryPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useToast();

  const exerciseId = params.get("exercise");
  const exercise: Exercise =
    exercises.find((e) => e.id === exerciseId) ?? exercises[0];

  const reps = Number(params.get("reps") ?? 0);
  const seconds = Number(params.get("seconds") ?? 0);
  const qualityScore = readStoredScore(exercise.id);

  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${remSec}s` : `${remSec}s`;
  const setsEquivalent = Math.max(1, Math.round(reps / exercise.targetReps));
  const calories = setsEquivalent * exercise.caloriesPerSet;
  const goalPct = Math.round(
    Math.min(reps / exercise.targetReps, 1) * 100,
  );

  // Persist this session to the backend exactly once.
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    void workoutApi
      .create({
        exercise_id: exercise.id,
        reps,
        duration_sec: seconds,
        calories,
        quality_score: qualityScore?.overall ?? 0,
      })
      .then(() => notify("Workout saved to your history", "success"))
      .catch(() => {
        // Non-fatal: the summary still displays even if saving fails.
        notify("Couldn't save this workout", "error");
      });
  }, [exercise.id, reps, seconds, calories, qualityScore, notify]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-motion-gradient">
          <Trophy className="h-8 w-8 text-ink-950" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-cream">
          Workout complete
        </h1>
        <p className="mt-2 text-slate-400">
          Nice work on {exercise.name.toLowerCase()}. Here&apos;s how it went.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          icon={Target}
          label="Reps completed"
          value={`${reps}`}
          accent="text-cyan-400"
        />
        <Stat
          icon={Clock}
          label="Duration"
          value={timeStr}
          accent="text-violet-400"
        />
        <Stat
          icon={Flame}
          label="Est. calories"
          value={`${calories}`}
          accent="text-coral-400"
        />
        <Stat
          icon={TrendingUp}
          label="Goal reached"
          value={`${goalPct}%`}
          accent="text-emerald-400"
        />
      </div>

      {qualityScore && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-cream">
            Form quality
          </h2>
          <QualityScoreCard score={qualityScore} />
          <p className="mt-2 text-xs text-slate-500">
            Score is a composite of range of motion, tempo, symmetry, and
            stability — all computed from joint angles, not a black box.
          </p>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold text-cream">
          Session details
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Exercise</dt>
            <dd className="text-cream">{exercise.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Muscle group</dt>
            <dd className="text-cream">{exercise.muscleGroup}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Target reps</dt>
            <dd className="text-cream">{exercise.targetReps}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Sets (equivalent)</dt>
            <dd className="text-cream">{setsEquivalent}</dd>
          </div>
        </dl>
        <p className="mt-5 rounded-xl bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
          Saved to your history. Streaks, XP, and badges have been updated.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => navigate(`/workout/live?exercise=${exercise.id}`)}
          className="btn-ghost flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" /> Repeat
        </button>
        <button onClick={() => navigate("/workout")} className="btn-primary">
          Back to workouts
        </button>
      </div>
    </div>
  );
}
