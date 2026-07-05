import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={align === "center" ? "text-center" : "text-left"}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-bold text-cream sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-slate-400 ${
            align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
