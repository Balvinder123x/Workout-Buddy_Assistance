import { motion } from "framer-motion";

interface ActivityHeatmapProps {
  data: number[][]; // rows = 7 days, cols = weeks; values 0-4
}

const levelClass: Record<number, string> = {
  0: "bg-white/5",
  1: "bg-violet-500/25",
  2: "bg-violet-500/50",
  3: "bg-violet-500/75",
  4: "bg-violet-400",
};

const dayLabels = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold text-cream">
        Activity
      </h3>
      <p className="mt-1 text-xs text-slate-500">Last 16 weeks</p>

      <div className="mt-4 flex gap-2 overflow-x-auto">
        <div className="flex flex-col justify-between py-0.5 text-[10px] text-slate-500">
          {dayLabels.map((d, i) => (
            <span key={i} className="h-3 leading-3">
              {d}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          {data[0].map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {data.map((row, dayIdx) => (
                <motion.div
                  key={dayIdx}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: (weekIdx * 7 + dayIdx) * 0.003,
                  }}
                  className={`h-3 w-3 rounded-sm ${levelClass[row[weekIdx]]}`}
                  title={`Intensity ${row[weekIdx]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-slate-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`h-3 w-3 rounded-sm ${levelClass[l]}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
