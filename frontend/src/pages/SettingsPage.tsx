import { motion } from "framer-motion";
import {
  AlertTriangle,
  Download,
  FileJson,
  Moon,
  Sheet,
  Sun,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/feedback/Toast";
import { useAuth } from "@/lib/AuthContext";
import { useLocalPrefs } from "@/lib/useLocalPrefs";
import { useTheme } from "@/lib/useTheme";
import { settingsApi } from "@/lib/settingsApi";

function SectionCard({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-lg font-semibold text-cream">{title}</h2>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      <div className="mt-3 divide-y divide-white/5">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { theme, toggle: toggleTheme } = useTheme();
  const { prefs, toggle } = useLocalPrefs();
  const { logout } = useAuth();

  const [exporting, setExporting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const doExport = async (fmt: "json" | "csv") => {
    setExporting(true);
    try {
      await settingsApi.exportHistory(fmt);
      notify(`Exported your history as ${fmt.toUpperCase()}`, "success");
    } catch {
      notify("Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await settingsApi.deleteAccount(confirmText);
      await logout();
      navigate("/");
    } catch (err) {
      setDeleteError(
        (err as { detail?: string })?.detail ?? "Could not delete account",
      );
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-slate-400">
          Manage your appearance, preferences, and data.
        </p>
      </motion.div>

      {/* Appearance */}
      <SectionCard title="Appearance">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-cream">Theme</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Switch between dark and light mode.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            {theme === "dark" ? (
              <>
                <Moon className="h-4 w-4" /> Dark
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" /> Light
              </>
            )}
          </button>
        </div>
      </SectionCard>

      {/* Preferences — local only */}
      <SectionCard
        title="Preferences"
        note="Saved on this device only — these don't sync to a server."
      >
        <Toggle
          label="Workout reminders"
          description="Show a reminder prompt on this device"
          checked={prefs.workoutReminders}
          onChange={() => toggle("workoutReminders")}
        />
        <Toggle
          label="Sound effects"
          description="Play sounds for reps and achievements"
          checked={prefs.soundEffects}
          onChange={() => toggle("soundEffects")}
        />
        <Toggle
          label="Public profile"
          description="A local preference flag (no public profiles exist yet)"
          checked={prefs.publicProfile}
          onChange={() => toggle("publicProfile")}
        />
      </SectionCard>

      {/* Data export */}
      <SectionCard
        title="Your data"
        note="Download everything you've logged. It's yours."
      >
        <div className="flex flex-wrap gap-3 py-3">
          <button
            onClick={() => doExport("json")}
            disabled={exporting}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <FileJson className="h-4 w-4" /> Export JSON
          </button>
          <button
            onClick={() => doExport("csv")}
            disabled={exporting}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <Sheet className="h-4 w-4" /> Export CSV
          </button>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Download className="h-3.5 w-3.5" />
            Downloads your full workout history
          </span>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <div className="rounded-2xl border border-coral-500/30 bg-coral-500/5 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-coral-300">
          <AlertTriangle className="h-5 w-5" /> Danger zone
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Permanently delete your account and all workout data. This can&apos;t
          be undone.
        </p>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="mt-4 flex items-center gap-2 rounded-xl border border-coral-500/40 px-4 py-2 text-sm text-coral-300 transition hover:bg-coral-500/10"
          >
            <Trash2 className="h-4 w-4" /> Delete account
          </button>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-300">
              Type <span className="font-mono font-bold text-coral-300">
                DELETE
              </span>{" "}
              to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="input max-w-xs"
            />
            {deleteError && (
              <p className="text-sm text-coral-400">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={doDelete}
                disabled={confirmText !== "DELETE" || deleting}
                className="flex items-center gap-2 rounded-xl bg-coral-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-coral-400 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting…" : "Permanently delete"}
              </button>
              <button
                onClick={() => {
                  setShowDelete(false);
                  setConfirmText("");
                  setDeleteError(null);
                }}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
