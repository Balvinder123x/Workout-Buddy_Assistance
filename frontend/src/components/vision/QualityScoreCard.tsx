import { motion } from "framer-motion";

import type { QualityScore } from "@/lib/pose/quality";

function scoreColor(v: number): string {
  if (v >= 80) return "#34d399";
  if (v >= 60) return "#22d3ee";
  if (v >= 40) return "#fb923c";
  return "#f43f5e";
}

function SubBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-display font-bold text-cream">{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: scoreColor(value) }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7 }}
        />
      </div>
    </div>
  );
}

export function QualityScoreCard({ score }: { score: QualityScore }) {
  const color = scoreColor(score.overall);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-6">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 42 * (1 - score.overall / 100),
              }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-cream">
              {score.overall}
            </span>
            <span className="text-[10px] text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <SubBar label="Range of motion" value={score.rom} />
          <SubBar label="Tempo" value={score.tempo} />
          <SubBar label="Symmetry" value={score.symmetry} />
          <SubBar label="Stability" value={score.stability} />
        </div>
      </div>
    </div>
  );
}
