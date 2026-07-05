import type { ReactNode } from "react";

type Tone = "violet" | "cyan" | "coral" | "emerald" | "slate";

const tones: Record<Tone, string> = {
  violet: "bg-violet-500/15 text-violet-300",
  cyan: "bg-cyan-500/15 text-cyan-300",
  coral: "bg-coral-500/15 text-coral-300",
  emerald: "bg-emerald-500/15 text-emerald-300",
  slate: "bg-white/10 text-slate-300",
};

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
