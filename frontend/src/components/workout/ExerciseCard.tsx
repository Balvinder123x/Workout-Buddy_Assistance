import { motion } from "framer-motion";
import { Clock, Dumbbell, Flame, Heart, Play, Video } from "lucide-react";

import { ExerciseIllustration } from "@/components/workout/ExerciseIllustration";
import { Badge } from "@/components/ui/Badge";
import type { Difficulty, Exercise } from "@/data/exercises";

const difficultyTone: Record<Difficulty, "emerald" | "cyan" | "coral"> = {
  Beginner: "emerald",
  Intermediate: "cyan",
  Advanced: "coral",
};

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStart: (exercise: Exercise) => void;
  onViewDemo: (exercise: Exercise) => void;
  delay?: number;
}

export function ExerciseCard({
  exercise,
  isFavorite,
  onToggleFavorite,
  onStart,
  onViewDemo,
  delay = 0,
}: ExerciseCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="glass group flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative h-32 overflow-hidden">
        <ExerciseIllustration
          muscleGroup={exercise.muscleGroup}
          className="h-full w-full"
        />
        <button
          onClick={() => onToggleFavorite(exercise.id)}
          aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 rounded-full bg-ink-950/50 p-2 backdrop-blur transition hover:bg-ink-950/70"
        >
          <Heart
            className={`h-4 w-4 transition ${
              isFavorite
                ? "fill-coral-400 text-coral-400"
                : "text-cream"
            }`}
          />
        </button>
        {exercise.mlSupported && (
          <span className="absolute left-3 top-3">
            <Badge tone="violet">AI-tracked</Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-cream">
            {exercise.name}
          </h3>
          <Badge tone={difficultyTone[exercise.difficulty]}>
            {exercise.difficulty}
          </Badge>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
          {exercise.description}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5 text-violet-400" />
            {exercise.muscleGroup}
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-coral-400" />
            {exercise.caloriesPerSet} kcal/set
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            {exercise.durationSec}s
          </div>
          <div className="flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-emerald-400" />
            {exercise.equipment}
          </div>
        </dl>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => onStart(exercise)}
            className="btn-primary flex flex-1 items-center justify-center gap-1.5 text-sm"
          >
            <Play className="h-4 w-4" /> Start
          </button>
          <button
            onClick={() => onViewDemo(exercise)}
            className="btn-ghost flex items-center justify-center gap-1.5 text-sm"
          >
            <Video className="h-4 w-4" /> Demo
          </button>
        </div>
      </div>
    </motion.article>
  );
}
