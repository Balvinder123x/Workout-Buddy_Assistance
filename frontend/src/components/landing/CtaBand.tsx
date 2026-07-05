import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CtaBand() {
  return (
    <section className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-strong relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-14 text-center"
      >
        <div className="absolute inset-0 bg-motion-gradient opacity-10" />
        <h2 className="relative font-display text-3xl font-bold text-cream sm:text-4xl">
          Train your next rep with a coach watching
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
          Set up takes a minute. Your camera does the rest.
        </p>
        <Link
          to="/register"
          className="btn-primary relative mx-auto mt-8 inline-flex items-center gap-2"
        >
          Get started free <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}
