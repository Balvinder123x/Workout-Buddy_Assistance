import { Activity, Gauge, Timer, Zap } from "lucide-react";

import type { PoseStats } from "@/lib/pose/usePoseCamera";

function StatChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="glass flex items-center gap-2 rounded-lg px-3 py-2">
      <Icon className={`h-4 w-4 ${accent}`} />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="font-display text-sm font-bold text-cream">{value}</p>
      </div>
    </div>
  );
}

export function PoseStatsHud({ stats }: { stats: PoseStats }) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatChip
        icon={Zap}
        label="FPS"
        value={`${stats.fps}`}
        accent="text-cyan-400"
      />
      <StatChip
        icon={Timer}
        label="Inference"
        value={`${stats.inferenceMs.toFixed(1)} ms`}
        accent="text-violet-400"
      />
      <StatChip
        icon={Gauge}
        label="Confidence"
        value={`${Math.round(stats.confidence * 100)}%`}
        accent="text-emerald-400"
      />
      <StatChip
        icon={Activity}
        label="Angle"
        value={stats.angle === null ? "—" : `${Math.round(stats.angle)}°`}
        accent="text-coral-400"
      />
    </div>
  );
}
