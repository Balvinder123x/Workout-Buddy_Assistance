import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { pricingTiers } from "@/data/landing";

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free, upgrade when it clicks"
          subtitle="Illustrative pricing for a portfolio demo."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-2xl p-8 ${
                tier.highlighted
                  ? "glass-strong ring-1 ring-violet-500/50"
                  : "glass"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-8 rounded-full bg-motion-gradient px-3 py-1 text-xs font-semibold text-ink-950">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-semibold text-cream">
                {tier.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-cream">
                  {tier.price}
                </span>
                <span className="text-sm text-slate-400">/ {tier.cadence}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`mt-8 block text-center text-sm ${
                  tier.highlighted ? "btn-primary" : "btn-ghost"
                }`}
              >
                Choose {tier.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
