import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ExerciseSlice, MetricPoint } from "@/data/mockDashboard";

const tooltipStyle = {
  background: "#16162a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#f5f3ef",
  fontSize: 13,
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold text-cream">
        {title}
      </h3>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4 h-56">{children}</div>
    </div>
  );
}

export function TrendAreaChart({
  data,
  color = "#a78bfa",
  fillId,
}: {
  data: MetricPoint[];
  color?: string;
  fillId: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis hide />
        <Tooltip contentStyle={tooltipStyle} cursor={{ opacity: 0.1 }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${fillId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendBarChart({ data }: { data: MetricPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="label"
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis hide />
        <Tooltip contentStyle={tooltipStyle} cursor={{ opacity: 0.1 }} />
        <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionDonut({ data }: { data: ExerciseSlice[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}
