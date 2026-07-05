# Deploying Smart Workout Buddy (Render + Vercel)

The app is split into a **FastAPI backend** (deploy on Render) and a **React
frontend** (deploy on Vercel). Because they live on different domains, three
things must line up: CORS, cross-site cookies, and the frontend's API URL. This
guide walks through all of it. Do the backend first — you need its URL for the
frontend, and the frontend's URL for the backend's CORS, so there's a little
back-and-forth at the end.

## 1. Backend on Render

**Option A — Blueprint (easiest).** In Render: **New → Blueprint**, connect your
repo. The included `render.yaml` provisions the web service and a free Postgres
database and wires `DATABASE_URL` automatically.

**Option B — Manual.** New → Web Service, connect the repo, then set:
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/api/health`
- Add a Postgres database (New → Postgres) and copy its **Internal Database
  URL** into a `DATABASE_URL` env var on the web service.

**Environment variables** (Render → your service → Environment):

| Key | Value |
| --- | --- |
| `DATABASE_URL` | (auto-set by the blueprint / your Postgres URL) |
| `COOKIE_CROSS_SITE` | `true` |
| `CORS_ORIGINS` | *your Vercel URL — you'll fill this in step 3* |
| `GEMINI_API_KEY` | *(optional)* your Gemini key for the AI coach |

Deploy. When it's live, note the URL, e.g. `https://smart-workout-buddy-api.onrender.com`.
Check `https://<that-url>/api/health` returns `{"status":"ok",...}`.

> **Free-tier note:** Render's free web services sleep after inactivity, so the
> first request after a while takes ~30–60s to wake. The app will look like it's
> hanging on first load — that's the cold start, not a bug.

## 2. Frontend on Vercel

In Vercel: **Add New → Project**, import the repo, then set:
- **Root Directory:** `frontend`
- **Framework Preset:** Vite (auto-detected)
- **Environment Variable:**

| Key | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-render-url>/api` |

(Note the `/api` suffix — the value is the full API base.)

Deploy. Note your Vercel URL, e.g. `https://smart-workout-buddy.vercel.app`.

## 3. Connect them (the step everyone forgets)

Go back to **Render → Environment** and set:

```
CORS_ORIGINS = https://smart-workout-buddy.vercel.app
```

Use your real Vercel URL, **no trailing slash**. To also allow Vercel preview
deployments, add them comma-separated:

```
CORS_ORIGINS = https://smart-workout-buddy.vercel.app,https://smart-workout-buddy-git-main-you.vercel.app
```

Save — Render redeploys automatically. Once it's back up, open your Vercel URL
and log in. Auth, dashboard, and all pages should now work.

## Why the original deploy failed (so you can debug future ones)

1. **CORS was hardcoded to `localhost:5173`.** Requests from the Vercel domain
   were rejected, so nothing loaded. Now `CORS_ORIGINS` is read from the env.
2. **The session cookie couldn't cross domains.** It was `SameSite=Lax; Secure=false`,
   which browsers refuse to send from one site to another. With
   `COOKIE_CROSS_SITE=true` it becomes `SameSite=None; Secure`, which is required
   for a Vercel-frontend / Render-backend split. This is why login appeared to
   work but every following request was unauthenticated.
3. **The frontend called `/api` on its own domain.** That's Vercel, not the
   backend. Now it uses `VITE_API_URL`.
4. **Direct links / refresh 404'd.** A single-page app needs all routes rewritten
   to `index.html`; `frontend/vercel.json` does that.
5. **SQLite on Render is wiped on every deploy.** Switched to Postgres via
   `DATABASE_URL` (SQLite still works locally with no config).

## Local development is unchanged

None of this affects running locally. With no env vars set, the backend uses
SQLite + localhost CORS + Lax cookies, and the frontend uses the `/api` dev proxy:

```bash
cd backend && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

## Common gotchas

- **Still can't log in?** Open browser DevTools → Network → the `login` request.
  If the response has no `set-cookie`, or the cookie is missing `SameSite=None;
  Secure`, then `COOKIE_CROSS_SITE` isn't `true` on Render. If subsequent requests
  are 401, the cookie isn't being sent back — same cause.
- **CORS error in the console?** `CORS_ORIGINS` on Render doesn't exactly match
  your Vercel origin (watch for `http` vs `https`, trailing slash, or the `www.`).
- **`VITE_API_URL` changes not taking effect?** Vite bakes env vars in at build
  time — you must **redeploy** the frontend after changing it.
- **First request hangs ~30s?** Render free-tier cold start. Upgrade the instance
  or just wait it out.
