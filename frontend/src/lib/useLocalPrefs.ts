import { useCallback, useEffect, useState } from "react";

/**
 * Local-only UI preferences.
 *
 * These are stored in localStorage on this device. They are NOT synced to a
 * server and don't drive any backend behavior (there's no push-notification
 * service or i18n layer to wire them to). The Settings UI labels them as such
 * rather than implying they do more than persist a preference.
 */
export interface LocalPrefs {
  workoutReminders: boolean;
  soundEffects: boolean;
  publicProfile: boolean;
}

const DEFAULTS: LocalPrefs = {
  workoutReminders: true,
  soundEffects: true,
  publicProfile: false,
};

const KEY = "swb_prefs";

function read(): LocalPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useLocalPrefs() {
  const [prefs, setPrefs] = useState<LocalPrefs>(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  }, [prefs]);

  const toggle = useCallback((key: keyof LocalPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return { prefs, toggle };
}
