import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useTheme } from "@/lib/useTheme";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Preview", href: "#preview" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="glass-strong mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-motion-gradient">
            <Dumbbell className="h-5 w-5 text-ink-950" />
          </span>
          <span className="font-display text-lg font-bold text-cream">
            Smart Workout Buddy
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-300 transition hover:text-cream"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={toggle}
            aria-label="Toggle color theme"
            className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:text-cream"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <Link to="/login" className="text-sm text-slate-300 hover:text-cream">
            Log in
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get started
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          className="rounded-lg border border-white/10 p-2 text-cream lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-strong mx-auto mt-2 max-w-6xl rounded-2xl p-5 lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-slate-300 transition hover:text-cream"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                <Link to="/login" className="btn-ghost flex-1 text-center text-sm">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary flex-1 text-center text-sm"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
