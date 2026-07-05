import { Link } from "react-router-dom";

import { AmbientBackground } from "@/components/ui/AmbientBackground";

interface PlaceholderProps {
  title: string;
  note: string;
  /** When true, render inside an existing layout (no full-screen wrapper). */
  embedded?: boolean;
}

/**
 * Styled placeholder for routes whose full implementation lands in a later
 * phase. Keeps navigation coherent without shipping fake functionality.
 * Used standalone (404) or embedded within the dashboard shell.
 */
export function PlaceholderPage({ title, note, embedded }: PlaceholderProps) {
  const card = (
    <div className="glass-strong max-w-md rounded-2xl p-10 text-center">
      <h1 className="font-display text-2xl font-bold text-cream">{title}</h1>
      <p className="mt-3 text-sm text-slate-400">{note}</p>
      {!embedded && (
        <Link to="/" className="btn-ghost mt-8 inline-block text-sm">
          Back home
        </Link>
      )}
    </div>
  );

  if (embedded) {
    return <div className="flex min-h-[60vh] items-center justify-center">{card}</div>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <AmbientBackground />
      {card}
    </div>
  );
}
