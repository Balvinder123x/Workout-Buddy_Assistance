import { api } from "@/lib/api";

export interface Workout {
  id: number;
  exercise_id: string;
  reps: number;
  duration_sec: number;
  calories: number;
  quality_score: number;
  xp: number;
  created_at: string;
}

export interface WorkoutCreate {
  exercise_id: string;
  reps: number;
  duration_sec: number;
  calories: number;
  quality_score: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface Stats {
  total_workouts: number;
  total_reps: number;
  total_calories: number;
  total_xp: number;
  level: number;
  xp_into_level: number;
  xp_for_level: number;
  streak: number;
  best_quality: number;
  avg_quality: number;
  distinct_exercises: number;
  badges: Badge[];
}

export type Period = "all" | "day" | "week" | "month";

export const workoutApi = {
  create: (payload: WorkoutCreate) => api.post<Workout>("/workouts", payload),
  list: (period: Period = "all") =>
    api.get<Workout[]>(`/workouts?period=${period}`),
  stats: () => api.get<Stats>("/workouts/stats"),
};
