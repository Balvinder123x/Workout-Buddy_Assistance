import { Brain, CheckCircle2, HelpCircle } from "lucide-react";

import type { ExerciseClass } from "@/lib/pose/features";

const LABELS: Record<ExerciseClass, string> = {
  squat: "Squat",
  pushup: "Push-up",
  curl: "Curl",
  "shoulder-press": "Shoulder Press",
  lunge: "Lunge",
};

interface DetectedExerciseProps {
  detected: ExerciseClass | null;
  confidence: number;
  selectedId: string;
}

/**
 * Shows the ML model's live prediction and whether it matches the exercise the
 * user selected. This is where the trained classifier surfaces in the UI.
 */
export function DetectedExercise({
  detected,
  confidence,
  selectedId,
}: DetectedExerciseProps) {
  const matches = detected === selectedId;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
        <Brain className="h-4 w-4 text-violet-400" />
        AI detected
      </div>

      {detected ? (
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="font-display text-xl font-bold text-cream">
              {LABELS[detected]}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {Math.round(confidence * 100)}% confidence
            </p>
          </div>
          {matches ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Match
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-coral-500/15 px-3 py-1 text-xs text-coral-300">
              <HelpCircle className="h-3.5 w-3.5" /> Mismatch
            </span>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Waiting for a clear pose…
        </p>
      )}
    </div>
  );
}
