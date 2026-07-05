# Smart Workout Buddy

An AI-powered fitness assistant that uses your webcam to count reps, recognize exercises, and give real-time form feedback — no wearables required. Built as a placement portfolio project with a focus on strong UI/UX, one genuine ML model, and computer vision.

## Tech stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, React Router
**Backend:** FastAPI, SQLAlchemy, SQLite
**ML / CV:** MediaPipe, TensorFlow, scikit-learn, XGBoost
**AI:** Gemini API

Everything runs locally. No Docker, no cloud, no external services beyond the Gemini API (added later).

## What's genuinely ML vs. not

Being explicit about this because it's the honest framing:

- **Exercise classification is a real, trained ML model** — Random Forest / XGBoost / MLP compared on pose keypoints, best model integrated. (Phase 6)
- **Form feedback is geometric**, not ML — joint-angle analysis with transparent, explainable rules. It is never presented as a trained model. (Phase 7)

## Project structure

```
smart-workout-buddy/
├── frontend/          React + TypeScript + Vite app
│   └── src/
│       ├── app/           App shell and router
│       ├── components/    landing/ · layout/ · ui/ (reusable)
│       ├── data/          Typed content (landing copy, etc.)
│       ├── lib/           Hooks and helpers
│       ├── pages/         Route pages
│       └── styles/        Tailwind entry + design tokens
├── backend/           FastAPI app (SQLite from Phase 2)
│   └── app/main.py
└── ml/                Training + evaluation scripts (from Phase 6)
```

## Running locally

**Frontend:**

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

**Backend:**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload    # http://localhost:8000
```

The Vite dev server proxies `/api` to the backend, so the frontend can call `/api/health` with no CORS setup.

## Authentication (Phase 2)

Session-based auth backed by SQLite. On register/login the backend creates a server-side session row and sets an httpOnly cookie; logout deletes that row so the session is genuinely invalidated. Passwords are bcrypt-hashed. "Remember me" extends the cookie/session lifetime from 8 hours to 30 days.

Endpoints (under `/api/auth`): `register`, `login`, `logout`, `me`.

The **Google button is UI-only** — this project deliberately doesn't implement real OAuth, and the interface says so on screen. That keeps the demo honest.

Run the backend tests:

```bash
cd backend && pytest -q
```

## Dashboard (Phase 3)

An app shell with a fixed sidebar (drawer on mobile) and sticky navbar with a profile dropdown wraps all authenticated pages via a nested route layout. The dashboard shows Fitbit/Nike-style metric cards, animated goal rings, Recharts trend/bar/donut charts, and a custom GitHub-style activity heatmap.

All dashboard values come from a single typed mock module (`src/data/mockDashboard.ts`), clearly labeled as sample data. Wiring it to real logged workouts is Phase 8 — keeping it as a mock avoids pretending there's an analytics backend that doesn't exist yet.

## Workout module (Phase 4)

A searchable, filterable exercise catalog (`src/data/exercises.ts`) with cards showing difficulty, muscle group, calories, equipment, and duration. Filters cover category, difficulty, and equipment; favorites persist to `localStorage` (a real favorites table would be premature before the history schema in Phase 8). A demo modal shows exercise details; starting an exercise opens a live-session shell with a timer, rep counter, and controls, then a summary screen.

Two honest choices: exercise "images" are self-contained gradient SVG illustrations per muscle group (no hotlinked photos that break or carry licensing issues), and the **live camera + pose tracking is a labeled placeholder** — it activates in Phase 5. The five ML-recognizable exercises (squat, push-up, curl, shoulder press, lunge) are tagged `mlSupported` so later phases can gate camera tracking to them.

## Computer vision (Phase 5)

Real-time pose estimation with **MediaPipe Pose running in the browser** (WASM) — no frames ever leave the device, which is the whole point for an edge story and also the privacy story. The live workout page for AI-tracked exercises shows the webcam with a skeleton overlay (33 landmarks drawn on a canvas), plus a live HUD of **FPS, per-frame inference time, keypoint confidence, and the tracked joint angle**. Camera controls: enable, pause/resume, reset, fullscreen.

**Rep counting is deterministic geometry, not ML.** For each supported exercise a joint-angle state machine counts a rep on a down→up transition (squat/lunge track the knee angle; push-up/curl/shoulder-press track the elbow angle). Shallow reps that don't cross the depth threshold don't count. This is explainable and honest — deciding *which* exercise is being performed is the separate ML model in Phase 6; here the exercise is already known from the user's selection.

The live workout page is code-split (`React.lazy`) so MediaPipe (~450 kB) only loads when a session actually starts, keeping the rest of the app fast. The WASM runtime and the pose model are fetched from Google's CDN at runtime.

Requires a browser with camera access; the model needs a moment to load on first use.

## Machine learning (Phase 6)

One genuinely trained model: a **frame-level exercise classifier** (squat / push-up / curl / shoulder-press / lunge) from pose keypoints. The pipeline lives in `ml/`:

```bash
cd ml
pip install -r requirements.txt
python src/train.py        # trains, compares, evaluates, exports ONNX
```

`train.py` compares **Random Forest, XGBoost, and an MLP** on an identical 80/20 stratified split, reports accuracy + macro precision/recall/F1 + per-class report + confusion matrix, and exports the best model (by macro-F1) to `models/exercise_classifier.onnx`. Metrics for all three are written to `models/metrics.json`. See `ml/MODEL_CARD.md` for the full write-up.

**Data honesty:** the shipped model is trained on a **synthetic bootstrap** — pose landmarks generated from biomechanical models of each exercise (`src/synth.py`), clearly labeled as such. It exists so the whole pipeline runs end-to-end without a camera. To train on real data, run `python src/record.py --exercise squat` to capture your own labeled frames into `data/poses.csv`; `train.py` then auto-detects and uses them. The model and evaluation are real; only the bootstrap data is synthetic.

**In-browser inference:** the ONNX model runs client-side via `onnxruntime-web`. During a live workout it classifies the pose every ~500 ms and the UI shows the detected exercise and whether it matches what you selected. The TypeScript feature extraction (`src/lib/pose/features.ts`) is kept in **exact numerical parity** with the Python `ml/src/features.py` — verified to ~1e-6 — so the browser computes the same features the model trained on.

This is separate from rep counting (geometric, Phase 5) and form feedback (geometric, Phase 7). The ML model answers "which exercise," not "how well."

## Form feedback (Phase 7)

Real-time form analysis, **entirely geometric — deliberately not ML**. There's no honest labeled dataset for named form faults, and transparent rules are more useful (and more defensible) than an opaque classifier.

- **Form rules** (`src/lib/pose/formRules.ts`): per-exercise checks that each fire from a measurable joint angle or position and explain why — knee-over-toe, forward lean, shallow depth, elbow flare, hip sag, swinging, partial lockout. Live cues appear during the workout.
- **Quality score** (`src/lib/pose/quality.ts`): a 0-100 composite of four sub-scores, each computed from pose geometry accumulated over the set — range of motion (depth vs. ideal), tempo (rep-duration consistency), symmetry (left/right balance), and stability (frame-to-frame jitter). Shown as a breakdown on the summary, so any score is explainable.
- **Voice feedback** via the browser Web Speech API, throttled so it doesn't nag. Toggle in the live workout header.

The quality score is a *constructed* metric, not a learned regression target — stated plainly because there's no ground-truth "quality" data to train against. Every sub-score maps to a measurable quantity.

## History & achievements (Phase 8)

This is where the app gets **real persistence** — now that there are actual sessions to store. A `workouts` table (SQLite) records each completed session (exercise, reps, duration, calories, quality score, XP, timestamp) tied to the user.

Endpoints (`/api/workouts`): save a workout, list history with `day`/`week`/`month`/`all` filters, and a `stats` aggregation. **XP, streaks, levels, and badges are all computed server-side from real logged data** (`app/core/gamification.py`) — nothing is mocked:

- **XP** = `reps * 2 + round(quality/10) * 5` per workout
- **Level** = square-root curve over total XP
- **Streak** = consecutive calendar days with a workout (counts back from today, or yesterday if today is empty)
- **Badges** = threshold checks on real totals (workout count, total reps, streak, best quality, exercise variety)

On the frontend, the workout summary now **saves the session automatically**, the History page shows the real list with a reps-over-time chart and period filters, the Achievements page shows level/XP/streak and the badge grid, and the dashboard's streak/XP tiles pull from real stats. Metrics the app genuinely doesn't track (steps, water, weight) remain clearly-labeled mock — the app never pretends to measure what it can't.

Run the backend tests: `cd backend && pytest -q` (14 tests).

## AI coach (Phase 9)

A chat-based fitness coach. **The Gemini API key lives only on the backend** — the frontend calls `/api/coach/chat`, which calls Gemini server-side. The key is never in browser code (verified: the built frontend bundle contains no API key or Gemini URL). Add your key to `backend/.env`:

```
GEMINI_API_KEY=your_key_here
```

**Grounded in real data:** before calling the model, the backend pulls the user's actual stats (streak, level, total reps, average/best form quality, exercise variety) and injects them into the prompt, so advice references genuine numbers rather than generic filler — a lightweight RAG over the user's own history.

**Works without a key:** if no key is set, the coach runs in a clearly-labeled *local mode* — a rules-based responder that answers from the same real stats. The UI shows which mode is active. This means the feature demos out-of-the-box and upgrades to full LLM replies when you add a key.

Frontend: a polished chat with a typing indicator, safe markdown rendering (no `dangerouslySetInnerHTML`, so no XSS from model output), suggested prompts, chat history sent as context, and **voice input** (Web Speech recognition) and **voice output** (speech synthesis).

Backend tests: `cd backend && pytest -q` (19 tests).

## Settings (Phase 10)

Profile management and account controls. The parts with real backend weight are done properly:

- **Profile** (`profiles` table): edit name, age, height, and weight; the backend computes **BMI** from height/weight. `GET`/`PATCH /api/settings/profile`.
- **Data export**: `GET /api/settings/export?fmt=json|csv` streams the user's full workout history as a downloadable file (proper `Content-Disposition`). Real data portability, not a stub.
- **Delete account**: `DELETE /api/settings/account` requires typing `DELETE` to confirm, then **cascades** — removing the user's sessions, workouts, and profile. Verified: the email is reusable afterward because the row is genuinely gone.

The remaining toggles are **honestly scoped**. Theme reuses the existing dark/light switch. Notification, sound, and "public profile" toggles are stored in `localStorage` and **labeled as device-local preferences** — the app doesn't pretend to run a push-notification service or public profiles that don't exist. Building fake systems behind those switches would be the dishonest choice.

Backend tests: `cd backend && pytest -q` (25 tests, including the delete-cascade check).

## Polish (Phase 11)

The final pass that makes the app feel finished:

- **Reusable states**: unified `Skeleton`, `EmptyState`, and `ErrorState` components (with retry) replace the ad-hoc "Loading…" divs across History, Achievements, Profile, and workout selection.
- **Toasts**: a `ToastProvider` gives visible success/error feedback on saving a workout, saving a profile, and exporting data — no more silent actions.
- **404 page**: a proper not-found page for unknown routes.
- **Accessibility**: keyboard focus-visible outlines on all interactive elements, `role`/`aria` on toggles and switches, and a `prefers-reduced-motion` guard that disables animation for users who ask for it.
- **Bundle / code-splitting**: the heavy authenticated pages (Coach, History, Achievements, Profile, Settings) are lazy-loaded, and vendor libraries (React, Recharts, Framer Motion) are split into separate cacheable chunks via `manualChunks`. This drops the main app chunk from ~805 kB to ~93 kB. The one remaining large chunk is the live-workout page (MediaPipe, ~450 kB), which is already code-split and only loads when a session starts — an inherent cost of running pose estimation in-browser, and the right trade-off for an on-device CV story.

Backend tests: `cd backend && pytest -q` (25 tests).

## Design direction

"Midnight athletic" — a deep indigo base with an electric violet→cyan motion gradient reserved for the signature element (the animated pose skeleton in the hero) and a coral accent for energy. Space Grotesk for display, Inter for body. Glassmorphism surfaces, restrained motion, reduced-motion respected, keyboard focus visible.

## Roadmap

- **Phase 1 — Frontend skeleton & landing page** ✅
- **Phase 2 — Authentication** ✅ (SQLite sessions, bcrypt, remember-me, protected routes)
- **Phase 3 — Dashboard** ✅ (fixed sidebar + navbar shell, metric cards, charts, activity heatmap)
- **Phase 4 — Workout module** ✅ (exercise catalog, search/filters, live session shell, summary)
- **Phase 5 — Computer vision** ✅ (in-browser MediaPipe pose, skeleton overlay, FPS/latency, angle-based rep counting)
- **Phase 6 — ML: exercise classification** ✅ (RF / XGBoost / MLP compared, ONNX export, in-browser inference)
- **Phase 7 — Form feedback** ✅ (geometric rule engine, quality score, live cues, voice feedback)
- **Phase 8 — History & achievements** ✅ (real SQLite persistence, streaks, XP, levels, badges)
- **Phase 9 — AI coach** ✅ (Gemini behind the backend, grounded in real stats, local fallback, voice)
- **Phase 10 — Settings** ✅ (profile + BMI, data export, delete account, local preferences)
- **Phase 11 — Polish** ✅ (404, loading/empty/error states, toasts, a11y, code-splitting)

**All 11 phases complete.**
