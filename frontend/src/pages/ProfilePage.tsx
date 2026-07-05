import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useToast } from "@/components/feedback/Toast";
import { type Profile, settingsApi } from "@/lib/settingsApi";

const goals = ["Build strength", "Lose weight", "Stay active", "Improve form"];

function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function ProfilePage() {
  const { notify } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  // Editable fields.
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    settingsApi
      .getProfile()
      .then((p) => {
        setProfile(p);
        setFullName(p.full_name);
        setAge(p.age?.toString() ?? "");
        setHeight(p.height_cm?.toString() ?? "");
        setWeight(p.weight_kg?.toString() ?? "");
        setGoal(p.goal ?? "");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await settingsApi.updateProfile({
        full_name: fullName || undefined,
        age: age ? Number(age) : undefined,
        height_cm: height ? Number(height) : undefined,
        weight_kg: weight ? Number(weight) : undefined,
        goal: goal || undefined,
      });
      setProfile(updated);
      setSaved(true);
      notify("Profile saved", "success");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(true);
      notify("Couldn't save your profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-12 text-center text-slate-400">
        Loading…
      </div>
    );
  }
  if (error && !profile) {
    return (
      <div className="glass rounded-2xl p-12 text-center text-coral-300">
        Couldn&apos;t load your profile. Is the backend running?
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-slate-400">
          Your details help personalize stats like BMI and coaching advice.
        </p>
      </motion.div>

      <div className="glass space-y-5 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-motion-gradient font-display text-2xl font-bold text-ink-950">
            {(profile?.full_name?.[0] ?? "?").toUpperCase()}
          </span>
          <div>
            <p className="font-display text-lg font-bold text-cream">
              {profile?.full_name}
            </p>
            <p className="text-sm text-slate-500">{profile?.email}</p>
          </div>
        </div>

        <Field label="Full name">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Age">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input"
              placeholder="—"
            />
          </Field>
          <Field label="Height (cm)">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input"
              placeholder="—"
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input"
              placeholder="—"
            />
          </Field>
        </div>

        <Field label="Goal">
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="input"
          >
            <option value="">No goal set</option>
            {goals.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>

        {profile?.bmi != null && (
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <span className="text-sm text-slate-400">Body Mass Index</span>
            <span className="text-sm font-medium text-cream">
              {profile.bmi}{" "}
              <span className="text-slate-500">
                ({bmiLabel(profile.bmi)})
              </span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-emerald-400"
            >
              Saved
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-slate-400">{label}</span>
      {children}
    </label>
  );
}
