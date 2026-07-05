import { api, API_BASE } from "@/lib/api";

export interface Profile {
  full_name: string;
  email: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  bmi: number | null;
}

export interface ProfileUpdate {
  full_name?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  goal?: string;
}

/**
 * Trigger a browser download of the export endpoint's file. The export route
 * returns a raw JSON/CSV attachment (not the app's usual JSON envelope), so we
 * fetch it directly and save the blob rather than using the api wrapper.
 */
async function downloadExport(fmt: "json" | "csv"): Promise<void> {
  const res = await fetch(`${API_BASE}/settings/export?fmt=${fmt}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout_history.${fmt}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const settingsApi = {
  getProfile: () => api.get<Profile>("/settings/profile"),
  updateProfile: (payload: ProfileUpdate) =>
    api.patch<Profile>("/settings/profile", payload),
  exportHistory: downloadExport,
  deleteAccount: (confirm: string) =>
    api.del<void>("/settings/account", { confirm }),
};
