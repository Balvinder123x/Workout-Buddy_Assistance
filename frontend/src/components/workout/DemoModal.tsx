import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { ExerciseIllustration } from "@/components/workout/ExerciseIllustration";
import { Badge } from "@/components/ui/Badge";
import type { Exercise } from "@/data/exercises";

interface DemoModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onStart: (exercise: Exercise) => void;
}

export function DemoModal({ exercise, onClose, onStart }: DemoModalProps) {
  return (
    <AnimatePresence>
      {exercise && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong w-full max-w-lg overflow-hidden rounded-3xl"
            >
              <div className="relative h-40">
                <ExerciseIllustration
                  muscleGroup={exercise.muscleGroup}
                  className="h-full w-full"
                />
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-4 top-4 rounded-full bg-ink-950/50 p-2 text-cream backdrop-blur transition hover:bg-ink-950/70"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-cream">
                    {exercise.name}
                  </h2>
                  {exercise.mlSupported && <Badge tone="violet">AI-tracked</Badge>}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {exercise.description}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-slate-500">Target</p>
                    <p className="font-display text-lg font-bold text-cream">
                      {exercise.targetReps === 1
                        ? `${exercise.durationSec}s`
                        : `${exercise.targetReps} reps`}
                    </p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-slate-500">Per set</p>
                    <p className="font-display text-lg font-bold text-cream">
                      {exercise.caloriesPerSet} kcal
                    </p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-slate-500">Equipment</p>
                    <p className="font-display text-sm font-bold text-cream">
                      {exercise.equipment}
                    </p>
                  </div>
                </div>

                {exercise.mlSupported ? (
                  <p className="mt-5 rounded-xl bg-violet-500/10 px-4 py-3 text-xs text-violet-300">
                    This exercise supports live form tracking. Your camera will
                    count reps and check form once you start (camera activates in
                    Phase 5).
                  </p>
                ) : (
                  <p className="mt-5 rounded-xl bg-white/5 px-4 py-3 text-xs text-slate-400">
                    Guided timer-based exercise. Live pose tracking isn&apos;t
                    available for this movement yet.
                  </p>
                )}

                <button
                  onClick={() => onStart(exercise)}
                  className="btn-primary mt-6 w-full"
                >
                  Start this exercise
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
