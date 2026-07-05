/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API, including the /api suffix. Set in
   * production (e.g. Vercel env: https://your-api.onrender.com/api). When
   * unset, the app uses the relative "/api" and Vite's dev proxy. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
