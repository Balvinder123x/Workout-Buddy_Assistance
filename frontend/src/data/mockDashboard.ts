/**
 * Mock dashboard data.
 *
 * This is illustrative sample data for the UI. Real values will come from
 * logged workouts once history is implemented (Phase 8). Keeping it in one
 * typed module makes the eventual swap to a real API a single-file change.
 */

export interface MetricPoint {
  label: string;
  value: number;
}

export interface ExerciseSlice {
  name: string;
  value: number;
  color: string;
}

export interface DashboardData {
  todayWorkout: string;
  caloriesToday: number;
  activeMinutes: number;
  exercisesCompleted: number;
  streakDays: number;
  weeklyGoalCurrent: number;
  weeklyGoalTarget: number;
  currentWeightKg: number;
  bmi: number;
  waterMl: number;
  waterTargetMl: number;
  steps: number;
  stepsTarget: number;
  workoutMinutesTrend: MetricPoint[];
  caloriesTrend: MetricPoint[];
  exerciseDistribution: ExerciseSlice[];
  weeklyProgress: MetricPoint[];
  /** 7 rows (days) x weeks of intensity values 0-4 for the activity heatmap. */
  activity: number[][];
}

export const mockDashboard: DashboardData = {
  todayWorkout: "Lower Body Strength",
  caloriesToday: 486,
  activeMinutes: 42,
  exercisesCompleted: 5,
  streakDays: 12,
  weeklyGoalCurrent: 4,
  weeklyGoalTarget: 5,
  currentWeightKg: 72.4,
  bmi: 22.6,
  waterMl: 1800,
  waterTargetMl: 2500,
  steps: 8340,
  stepsTarget: 10000,
  workoutMinutesTrend: [
    { label: "Mon", value: 35 },
    { label: "Tue", value: 48 },
    { label: "Wed", value: 30 },
    { label: "Thu", value: 55 },
    { label: "Fri", value: 42 },
    { label: "Sat", value: 60 },
    { label: "Sun", value: 42 },
  ],
  caloriesTrend: [
    { label: "Mon", value: 420 },
    { label: "Tue", value: 560 },
    { label: "Wed", value: 380 },
    { label: "Thu", value: 610 },
    { label: "Fri", value: 486 },
    { label: "Sat", value: 720 },
    { label: "Sun", value: 486 },
  ],
  exerciseDistribution: [
    { name: "Squat", value: 32, color: "#8b5cf6" },
    { name: "Push-up", value: 24, color: "#22d3ee" },
    { name: "Curl", value: 18, color: "#fb7185" },
    { name: "Shoulder Press", value: 14, color: "#a78bfa" },
    { name: "Lunge", value: 12, color: "#34d399" },
  ],
  weeklyProgress: [
    { label: "W1", value: 68 },
    { label: "W2", value: 72 },
    { label: "W3", value: 79 },
    { label: "W4", value: 85 },
  ],
  activity: buildActivity(),
};

/** Deterministic pseudo-random activity grid so the heatmap looks lived-in. */
function buildActivity(): number[][] {
  const weeks = 16;
  const rows: number[][] = [];
  for (let day = 0; day < 7; day++) {
    const week: number[] = [];
    for (let w = 0; w < weeks; w++) {
      const seed = (day * 31 + w * 17) % 11;
      week.push(seed > 7 ? 4 : seed > 5 ? 3 : seed > 3 ? 2 : seed > 1 ? 1 : 0);
    }
    rows.push(week);
  }
  return rows;
}
