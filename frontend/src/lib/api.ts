/**
 * Minimal typed fetch wrapper. Uses credentials: "include" so the httpOnly
 * session cookie set by the backend is sent on every request.
 *
 * BASE resolves to VITE_API_URL in production (your Render backend, e.g.
 * https://your-api.onrender.com/api) and falls back to the relative "/api"
 * locally, where Vite's dev server proxies /api to the backend.
 */

const RAW_BASE = import.meta.env.VITE_API_URL ?? "/api";
// Trim any trailing slash so `${BASE}${path}` never produces a double slash.
const BASE = RAW_BASE.replace(/\/$/, "");

/** Exposed for direct fetch cases (e.g. file downloads that aren't JSON). */
export const API_BASE = BASE;

export interface ApiError {
  status: number;
  detail: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
        detail = body.detail[0].msg;
      }
    } catch {
      // Non-JSON error body; keep the status text.
    }
    const error: ApiError = { status: response.status, detail };
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
