import { motion } from "framer-motion";
import { BarChart3, MessageSquare, Dumbbell } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionHeading } from "@/components/ui/SectionHeading";

const trendData = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 71 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 79 },
  { day: "Fri", score: 85 },
  { day: "Sat", score: 82 },
  { day: "Sun", score: 91 },
];

type Tab = "workout" | "coach" | "analytics";

const tabs: { id: Tab; label: string; icon: typeof Dumbbell }[] = [
  { id: "workout", label: "Live workout", icon: Dumbbell },
  { id: "coach", label: "AI coach", icon: MessageSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function ProductPreview() {
  const [active, setActive] = useState<Tab>("analytics");

  return (
    <section id="preview" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="A look inside"
          title="Built to feel like a real product"
          subtitle="Switch between the workout view, the coach, and your analytics."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
                active === tab.id
                  ? "bg-motion-gradient text-ink-950"
                  : "glass text-slate-300 hover:text-cream"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-strong mt-8 rounded-3xl p-6 sm:p-10"
        >
          {active === "analytics" && (
            <div>
              <div className="mb-6 flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-slate-400">Weekly form quality</p>
                  <p className="font-display text-3xl font-bold text-cream">
                    91<span className="text-lg text-slate-400">/100</span>
                  </p>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-400">
                  +12% this week
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                        <stop
                          offset="100%"
                          stopColor="#22d3ee"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis hide domain={[40, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "#16162a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "#f5f3ef",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      fill="url(#scoreFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {active === "coach" && (
            <div className="space-y-4">
              <div className="max-w-md rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-sm text-slate-200">
                How was my squat form today?
              </div>
              <div className="ml-auto max-w-md rounded-2xl rounded-tr-sm bg-motion-gradient px-4 py-3 text-sm text-ink-950">
                Your depth improved — 9 of 12 reps hit parallel, up from 5
                yesterday. Watch a slight forward lean on the last three; brace
                your core before descending.
              </div>
              <div className="max-w-md rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-sm text-slate-200">
                What should I train tomorrow?
              </div>
            </div>
          )}

          {active === "workout" && (
            <div className="grid gap-6 sm:grid-cols-[1fr_0.8fr]">
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-ink-900">
                <span className="text-sm text-slate-500">
                  Live camera + skeleton overlay
                </span>
              </div>
              <div className="flex flex-col justify-center gap-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-slate-400">Exercise</p>
                  <p className="font-display text-xl font-bold text-cream">
                    Push-up
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-slate-400">Reps</p>
                  <p className="font-display text-xl font-bold text-cyan-400">
                    18
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-slate-400">Form cue</p>
                  <p className="text-sm text-coral-400">Lower your hips</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
