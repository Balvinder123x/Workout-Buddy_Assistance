import { motion } from "framer-motion";
import { Dumbbell, Flame, Target, Timer } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { exercises } from "@/data/exercises";
import { EmptyState, ErrorState, SkeletonCard } from "@/components/feedback/States";
import { useHistory } from "@/lib/useWorkouts";
import type { Period } from "@/lib/workoutApi";

const periods: { id: Period; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "all", label: "All" },
];

function exerciseName(id: string): string {
  return exercises.find((e) => e.id === id)?.name ?? id;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryPage() {
  const [period, setPeriod] = useState<Period>("week");
  const { workouts, loading, error } = useHistory(period);

  // Aggregate reps per day for the chart (oldest -> newest).
  const byDay = new Map<string, number>();
  for (const w of [...workouts].reverse()) {
    const day = new Date(w.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    byDay.set(day, (byDay.get(day) ?? 0) + w.reps);
  }
  const chartData = [...byDay.entries()].map(([label, reps]) => ({
    label,
    reps,
  }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
          Workout history
        </h1>
        <p className="mt-1 text-slate-400">
          Every session you&apos;ve logged, straight from your own records.
        </p>
      </motion.div>

      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              period === p.id
                ? "bg-motion-gradient text-ink-950"
                : "glass text-slate-300 hover:text-cream"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold text-cream">
            Reps over time
          </h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#16162a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#f5f3ef",
                  }}
                  cursor={{ opacity: 0.1 }}
                />
                <Bar dataKey="reps" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState message="Couldn't load your history. Is the backend running?" />
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts yet"
          message="Start a workout and it'll show up here with your reps, calories, and XP."
        />
      ) : (
        <div className="space-y-3">
          {workouts.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-motion-gradient">
                  <Dumbbell className="h-5 w-5 text-ink-950" />
                </span>
                <div>
                  <p className="font-medium text-cream">
                    {exerciseName(w.exercise_id)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(w.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Target className="h-4 w-4 text-cyan-400" /> {w.reps}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Timer className="h-4 w-4 text-violet-400" />
                  {w.duration_sec}s
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Flame className="h-4 w-4 text-coral-400" /> {w.calories}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-300">
                  +{w.xp} XP
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
