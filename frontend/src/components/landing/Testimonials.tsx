import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/landing";

export function Testimonials() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="From the field"
          title="People who stopped guessing"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <GlassCard key={t.name} delay={i * 0.05}>
              <p className="text-sm leading-relaxed text-slate-200">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-motion-gradient font-display font-bold text-ink-950">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-cream">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
