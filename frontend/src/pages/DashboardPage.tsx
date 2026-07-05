import { motion } from "framer-motion";
import {
  Activity,
  Award,
  Dumbbell,
  Flame,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import {
  ChartCard,
  DistributionDonut,
  TrendAreaChart,
  TrendBarChart,
} from "@/components/dashboard/Charts";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { EmptyState, ErrorState, SkeletonCard } from "@/components/feedback/States";
import { useAuth } from "@/lib/AuthContext";
import { useDashboard } from "@/lib/useDashboard";
import { Link } from "react-router-dom";

// A modest weekly workout goal used only to render the progress ring.
const WEEKLY_GOAL = 5;

export function DashboardPage() {
  const { user } = useAuth();
  const dash = useDashboard();
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  if (dash.loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (dash.error || !dash.stats) {
    return (
      <ErrorState message="Couldn't load your dashboard. Is the backend running?" />
    );
  }

  const s = dash.stats;
  const hasData = s.total_workouts > 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
          Good to see you, {firstName}
        </h1>
        <p className="mt-1 text-slate-400">
          {hasData
            ? "Here's your training at a glance — all from your logged workouts."
            : "Your dashboard starts empty and fills in as you train. Let's log your first workout."}
        </p>
      </motion.div>

      {!hasData && (
        <EmptyState
          icon={Dumbbell}
          title="No workouts yet"
          message="Every stat here is real — it starts at zero and grows each time you complete a workout."
          action={
            <Link to="/workout" className="btn-primary">
              Start your first workout
            </Link>
          }
        />
      )}

      {/* Top metrics — real values, zero for a new user. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={Flame}
          label="Calories today"
          value={`${dash.caloriesToday}`}
          sub="kcal from today's workouts"
          accent="text-coral-400"
          delay={0.02}
        />
        <MetricCard
          icon={Timer}
          label="Active time today"
          value={`${dash.activeMinutesToday} min`}
          sub={`${dash.workoutsToday} workout${dash.workoutsToday === 1 ? "" : "s"} today`}
          accent="text-cyan-400"
          delay={0.06}
        />
        <MetricCard
          icon={Target}
          label="Reps today"
          value={`${dash.repsToday}`}
          sub={`${s.total_reps} all-time`}
          accent="text-violet-400"
          delay={0.1}
        />
        <MetricCard
          icon={Activity}
          label="Current streak"
          value={`${s.streak} day${s.streak === 1 ? "" : "s"}`}
          sub={`${s.total_workouts} workouts logged`}
          accent="text-emerald-400"
          delay={0.14}
        />
      </div>

      {/* Level / goal rings + XP + quality */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="glass flex items-center justify-around rounded-2xl p-6 lg:col-span-2">
          <ProgressRing
            current={Math.min(s.total_workouts, WEEKLY_GOAL)}
            target={WEEKLY_GOAL}
            label="Weekly goal"
          />
          <ProgressRing
            current={s.xp_into_level}
            target={s.xp_for_level}
            label={`Level ${s.level}`}
          />
        </div>
        <MetricCard
          icon={Zap}
          label="Total XP"
          value={`${s.total_xp}`}
          sub={`Level ${s.level}`}
          accent="text-violet-400"
        />
        <MetricCard
          icon={Award}
          label="Avg form quality"
          value={hasData ? `${s.avg_quality}` : "—"}
          sub={hasData ? `best ${s.best_quality}/100` : "no data yet"}
          accent="text-cyan-400"
        />
      </div>

      {/* Trends from real workouts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Workout minutes" subtitle="Last 7 days">
          <TrendAreaChart data={dash.minutesTrend} fillId="minutesFill" />
        </ChartCard>
        <ChartCard title="Calories burned" subtitle="Last 7 days">
          <TrendBarChart data={dash.caloriesTrend} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Exercise mix" subtitle="All time">
          {dash.distribution.length > 0 ? (
            <div className="flex h-full items-center gap-4">
              <div className="h-full flex-1">
                <DistributionDonut data={dash.distribution} />
              </div>
              <ul className="space-y-2">
                {dash.distribution.map((slice) => (
                  <li
                    key={slice.name}
                    className="flex items-center gap-2 text-xs text-slate-300"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    {slice.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Log workouts to see your mix
            </div>
          )}
        </ChartCard>
        <ChartCard title="Form quality" subtitle="Recent workouts">
          {dash.qualityTrend.length > 0 ? (
            <TrendAreaChart
              data={dash.qualityTrend}
              color="#22d3ee"
              fillId="progressFill"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No workouts yet
            </div>
          )}
        </ChartCard>
        <div className="flex flex-col justify-center gap-4">
          <MetricCard
            icon={TrendingUp}
            label="Exercises tried"
            value={`${s.distinct_exercises} / 5`}
            sub="tracked movements"
            accent="text-emerald-400"
          />
          <MetricCard
            icon={Award}
            label="Badges earned"
            value={`${s.badges.filter((b) => b.earned).length}`}
            sub={`of ${s.badges.length}`}
            accent="text-violet-400"
          />
        </div>
      </div>

      <ActivityHeatmap data={dash.activity} />
    </div>
  );
}
