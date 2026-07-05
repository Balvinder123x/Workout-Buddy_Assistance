import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Search, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/AuthContext";

interface AppNavbarProps {
  onMenuClick: () => void;
}

export function AppNavbar({ onMenuClick }: AppNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initial = user?.full_name?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="glass-strong sticky top-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg border border-white/10 p-2 text-cream lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search workouts…"
            className="w-64 rounded-xl border border-white/10 bg-ink-900/60 py-2 pl-9 pr-3 text-sm text-cream outline-none transition placeholder:text-slate-500 focus:border-violet-500"
          />
        </div>
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-white/10 py-1.5 pl-1.5 pr-3 transition hover:border-white/25"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-motion-gradient font-display text-sm font-bold text-ink-950">
            {initial}
          </span>
          <span className="hidden text-sm text-cream sm:block">
            {user?.full_name}
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="glass-strong absolute right-0 mt-2 w-48 rounded-xl p-2"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-cream"
              >
                <UserIcon className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-coral-400 transition hover:bg-coral-500/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
