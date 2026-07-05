import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

import { AmbientBackground } from "@/components/ui/AmbientBackground";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <AmbientBackground />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center"
      >
        <p className="font-display text-8xl font-bold text-transparent [background:var(--tw-gradient-to)] [-webkit-background-clip:text] bg-motion-gradient bg-clip-text">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-cream">
          Page not found
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
          Let&apos;s get you back on track.
        </p>
        <Link
          to="/"
          className="btn-primary mt-6 inline-flex items-center gap-2"
        >
          <Home className="h-4 w-4" /> Back home
        </Link>
      </motion.div>
    </div>
  );
}
