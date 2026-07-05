import { useEffect, useState } from "react";

import { exercises } from "@/data/exercises";
import type { ExerciseSlice, MetricPoint } from "@/data/mockDashboard";
import { type Stats, type Workout, workoutApi } from "@/lib/workoutApi";

export interface DashboardData {
  stats: Stats | null;
  loading: boolean;
  error: boolean;
  /** Calories burned today (from workouts logged today). */
  caloriesToday: number;
  /** Active minutes today (sum of durations, in minutes). */
  activeMinutesToday: number;
  /** Reps logged today. */
  repsToday: number;
  /** Workouts logged today. */
  workoutsToday: number;
  /** Minutes trend over the last 7 days. */
  minutesTrend: MetricPoint[];
  /** Calories trend over the last 7 days. */
  caloriesTrend: MetricPoint[];
  /** Form-quality trend over recent workouts. */
  qualityTrend: MetricPoint[];
  /** Exercise mix (share of workouts by exercise). */
  distribution: ExerciseSlice[];
  /** 7 rows (days) x N weeks activity grid, values 0-4. */
  activity: number[][];
}

const SLICE_COLORS = ["#8b5cf6", "#22d3ee", "#fb7185", "#34d399", "#f59e0b"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function exerciseName(id: string): string {
  return exercises.find((e) => e.id === id)?.name ?? id;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Builds the last-7-days series for a metric derived from workouts. */
function last7DaysSeries(
  workouts: Workout[],
  valueOf: (w: Workout) => number,
): MetricPoint[] {
  const today = new Date();
  const series: MetricPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const total = workouts
      .filter((w) => sameDay(new Date(w.created_at), day))
      .reduce((sum, w) => sum + valueOf(w), 0);
    series.push({ label: DAY_LABELS[day.getDay()], value: total });
  }
  return series;
}

export function useDashboard(): DashboardData {
  const [stats, setStats] = useState<Stats | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([workoutApi.stats(), workoutApi.list("all")])
      .then(([s, w]) => {
        setStats(s);
        setWorkouts(w);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const todays = workouts.filter((w) => sameDay(new Date(w.created_at), today));

  const caloriesToday = todays.reduce((s, w) => s + w.calories, 0);
  const activeMinutesToday = Math.round(
    todays.reduce((s, w) => s + w.duration_sec, 0) / 60,
  );
  const repsToday = todays.reduce((s, w) => s + w.reps, 0);

  // Exercise distribution by workout count.
  const counts = new Map<string, number>();
  for (const w of workouts) {
    counts.set(w.exercise_id, (counts.get(w.exercise_id) ?? 0) + 1);
  }
  const distribution: ExerciseSlice[] = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, value], i) => ({
      name: exerciseName(id),
      value,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    }));

  // Quality trend across the most recent (up to) 10 workouts, oldest first.
  const qualityTrend: MetricPoint[] = [...workouts]
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    .slice(-10)
    .map((w, i) => ({ label: `${i + 1}`, value: w.quality_score }));

  // Activity grid: 7 rows (days) x 8 weeks, intensity 0-4 by workout count.
  const weeks = 8;
  const activity: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: weeks }, () => 0),
  );
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - (weeks * 7 - 1));
  for (const w of workouts) {
    const d = new Date(w.created_at);
    const diffDays = Math.floor(
      (d.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0 || diffDays >= weeks * 7) continue;
    const col = Math.floor(diffDays / 7);
    const row = d.getDay();
    activity[row][col] = Math.min(4, activity[row][col] + 1);
  }

  return {
    stats,
    loading,
    error,
    caloriesToday,
    activeMinutesToday,
    repsToday,
    workoutsToday: todays.length,
    minutesTrend: last7DaysSeries(workouts, (w) =>
      Math.round(w.duration_sec / 60),
    ),
    caloriesTrend: last7DaysSeries(workouts, (w) => w.calories),
    qualityTrend,
    distribution,
    activity,
  };
}
