import { motion } from "framer-motion";
import { AlertCircle, Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** A shimmering skeleton block for loading placeholders. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/5 ${className}`}
      aria-hidden="true"
    />
  );
}

/** A card-shaped skeleton used while list/stat content loads. */
export function SkeletonCard() {
  return (
    <div className="glass space-y-3 rounded-2xl p-5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

interface StateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
}

/** Friendly empty state with an optional call-to-action. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
}: StateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col items-center rounded-2xl p-12 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
        <Icon className="h-7 w-7 text-slate-500" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-cream">
        {title}
      </h3>
      {message && (
        <p className="mt-1 max-w-sm text-sm text-slate-400">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

/** Error state with an optional retry button. */
export function ErrorState({
  title = "Something went wrong",
  message = "Please try again. If this keeps happening, check that the backend is running.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass flex flex-col items-center rounded-2xl p-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-500/10">
        <AlertCircle className="h-7 w-7 text-coral-400" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-cream">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-5 text-sm">
          Try again
        </button>
      )}
    </div>
  );
}
