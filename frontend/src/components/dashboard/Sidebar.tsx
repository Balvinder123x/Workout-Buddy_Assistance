import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, LogOut, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { navItems } from "@/components/dashboard/navItems";
import { useAuth } from "@/lib/AuthContext";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-full flex-col">
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2 px-2 py-1"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-motion-gradient">
          <Dumbbell className="h-5 w-5 text-ink-950" />
        </span>
        <span className="font-display text-base font-bold text-cream">
          Workout Buddy
        </span>
      </NavLink>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isActive
                  ? "bg-motion-gradient font-medium text-ink-950"
                  : "text-slate-400 hover:bg-white/5 hover:text-cream",
              ].join(" ")
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-coral-500/10 hover:text-coral-400"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </div>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Fixed desktop sidebar */}
      <aside className="glass-strong fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col p-5 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="glass-strong fixed left-0 top-0 z-50 flex h-screen w-64 flex-col p-5 lg:hidden"
            >
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="absolute right-4 top-4 text-slate-400 hover:text-cream"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
