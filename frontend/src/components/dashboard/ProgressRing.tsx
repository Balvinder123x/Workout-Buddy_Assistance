import { motion } from "framer-motion";

interface ProgressRingProps {
  current: number;
  target: number;
  label: string;
  unit?: string;
  size?: number;
}

export function ProgressRing({
  current,
  target,
  label,
  unit = "",
  size = 120,
}: ProgressRingProps) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(current / target, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={10}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-cream">
            {Math.round(pct * 100)}%
          </span>
          <span className="text-xs text-slate-500">
            {current}/{target}
            {unit}
          </span>
        </div>
      </div>
      <span className="mt-3 text-sm text-slate-400">{label}</span>
    </div>
  );
}
