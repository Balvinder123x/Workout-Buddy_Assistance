import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { features } from "@/data/landing";

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="What it does"
          title="Everything a good coach watches for"
          subtitle="Six capabilities working together, from the first rep to the weekly review."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <GlassCard key={feature.title} delay={i * 0.05}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-motion-gradient">
                <feature.icon className="h-5 w-5 text-ink-950" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-cream">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
