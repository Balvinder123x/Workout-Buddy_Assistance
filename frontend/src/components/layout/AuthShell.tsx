import { motion } from "framer-motion";
import { Dumbbell, Sparkles } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { useAuth } from "@/lib/AuthContext";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  /**
   * Optional: called with the demo credentials so a page can visibly fill its
   * form fields before the demo logs in. When omitted, the demo logs in
   * directly without touching any form.
   */
  onFillDemo?: (email: string, password: string) => void;
}

const DEMO_EMAIL = "demo@gmail.com";
const DEMO_PASSWORD = "12345678";
const DEMO_NAME = "Demo User";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  onFillDemo,
}: AuthShellProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const startDemo = async () => {
    setDemoLoading(true);
    setDemoError(null);
    // Visibly fill the form fields (if the page provided a handler) so the
    // user sees the demo credentials being used.
    onFillDemo?.(DEMO_EMAIL, DEMO_PASSWORD);
    try {
      // Log into the demo account if it exists; otherwise create it first.
      try {
        await login({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          remember_me: false,
        });
      } catch {
        await register({
          email: DEMO_EMAIL,
          full_name: DEMO_NAME,
          password: DEMO_PASSWORD,
        });
      }
      navigate("/dashboard");
    } catch {
      setDemoError("Couldn't start the demo. Is the backend running?");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AmbientBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong w-full max-w-md rounded-3xl p-8"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-motion-gradient">
            <Dumbbell className="h-5 w-5 text-ink-950" />
          </span>
          <span className="font-display text-lg font-bold text-cream">
            Smart Workout Buddy
          </span>
        </Link>

        <h1 className="text-center font-display text-2xl font-bold text-cream">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">{subtitle}</p>

        <div className="mt-8">{children}</div>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wider text-slate-500">
            or
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* One-tap demo account — logs into (or creates) a shared demo user. */}
        <button
          type="button"
          onClick={startDemo}
          disabled={demoLoading}
          className="btn-ghost flex w-full items-center justify-center gap-2 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4 text-violet-400" />
          {demoLoading ? "Starting demo…" : "Try demo account"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          Instantly explore with {DEMO_EMAIL} — no signup needed.
        </p>
        {demoError && (
          <p className="mt-2 text-center text-xs text-coral-400">{demoError}</p>
        )}

        <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>
      </motion.div>
    </div>
  );
}
