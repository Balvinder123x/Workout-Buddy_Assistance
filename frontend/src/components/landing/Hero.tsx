import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

import { PoseSkeleton } from "@/components/landing/PoseSkeleton";
import { stats } from "@/data/landing";

export function Hero() {
  return (
    <section className="relative px-6 pt-40 pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Computer-vision fitness coaching
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-display text-5xl font-bold leading-[1.05] text-cream sm:text-6xl"
          >
            Your camera is
            <br />
            <span className="gradient-text">your coach.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg text-slate-400"
          >
            Smart Workout Buddy reads your body in real time — counting reps,
            recognizing exercises, and correcting your form the moment it slips.
            No wearables, no guesswork.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2">
              Start training <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#preview" className="btn-ghost flex items-center gap-2">
              <Play className="h-4 w-4" /> See it work
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl font-bold text-cream">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs text-slate-400">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="glass-strong relative aspect-[3/4] overflow-hidden rounded-3xl p-8">
            <div className="absolute inset-0 bg-motion-gradient opacity-10" />
            <PoseSkeleton />
            <div className="absolute bottom-6 left-6 right-6 glass rounded-xl px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Squat detected</span>
                <span className="font-display font-bold text-cyan-400">
                  Rep 12
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
