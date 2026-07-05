import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "AI Coach", "Analytics"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

export function MarketingFooter() {
  return (
    <footer id="contact" className="border-t border-white/10 px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-motion-gradient">
              <Dumbbell className="h-5 w-5 text-ink-950" />
            </span>
            <span className="font-display text-lg font-bold text-cream">
              Smart Workout Buddy
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            An AI fitness coach that watches your form and helps you train
            smarter — no wearables required.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-cream">{col.title}</h3>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 transition hover:text-cream"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Smart Workout Buddy. A portfolio project.
      </div>
    </footer>
  );
}
