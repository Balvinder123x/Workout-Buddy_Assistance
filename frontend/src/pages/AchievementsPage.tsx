import { motion } from "framer-motion";
import { Award, Flame, Lock, Star, Zap } from "lucide-react";

import { ErrorState, SkeletonCard } from "@/components/feedback/States";
import { useStats } from "@/lib/useWorkouts";

export function AchievementsPage() {
  const { stats, loading, error, reload } = useStats();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }
  if (error || !stats) {
    return (
      <ErrorState
        message="Couldn't load achievements. Is the backend running?"
        onRetry={reload}
      />
    );
  }

  const xpPct =
    stats.xp_for_level > 0
      ? Math.round((stats.xp_into_level / stats.xp_for_level) * 100)
      : 0;
  const earned = stats.badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
          Achievements
        </h1>
        <p className="mt-1 text-slate-400">
          Earned from your real training — {earned} of {stats.badges.length}{" "}
          badges unlocked.
        </p>
      </motion.div>

      {/* Level + XP */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-motion-gradient font-display text-xl font-bold text-ink-950">
              {stats.level}
            </span>
            <div>
              <p className="font-display text-lg font-bold text-cream">
                Level {stats.level}
              </p>
              <p className="text-xs text-slate-500">
                {stats.total_xp} total XP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-coral-300">
              <Flame className="h-4 w-4" /> {stats.streak}-day streak
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Zap className="h-4 w-4" /> {stats.total_workouts} workouts
            </span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress to level {stats.level + 1}</span>
            <span>
              {stats.xp_into_level} / {stats.xp_for_level} XP
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-motion-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className={`glass rounded-2xl p-5 ${
              badge.earned ? "" : "opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  badge.earned
                    ? "bg-motion-gradient"
                    : "border border-white/10 bg-white/5"
                }`}
              >
                {badge.earned ? (
                  <Award className="h-5 w-5 text-ink-950" />
                ) : (
                  <Lock className="h-5 w-5 text-slate-500" />
                )}
              </span>
              {badge.earned && (
                <Star className="h-4 w-4 fill-cyan-400 text-cyan-400" />
              )}
            </div>
            <h3 className="mt-4 font-display font-semibold text-cream">
              {badge.name}
            </h3>
            <p className="mt-1 text-xs text-slate-400">{badge.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
