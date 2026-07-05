import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  delay?: number;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "text-cyan-400",
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-cream">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}
