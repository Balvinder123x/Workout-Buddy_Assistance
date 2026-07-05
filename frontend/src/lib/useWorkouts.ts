import { useCallback, useEffect, useState } from "react";

import {
  type Period,
  type Stats,
  type Workout,
  workoutApi,
} from "@/lib/workoutApi";

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    workoutApi
      .stats()
      .then((s) => {
        setStats(s);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);
  return { stats, loading, error, reload };
}

export function useHistory(period: Period) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    workoutApi
      .list(period)
      .then((w) => {
        setWorkouts(w);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [period]);

  return { workouts, loading, error };
}
