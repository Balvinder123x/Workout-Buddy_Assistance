"""Application configuration.

Kept intentionally simple: a few module-level constants rather than a settings
framework, since everything runs locally for this portfolio project.
"""
from pathlib import Path
import os

from dotenv import load_dotenv

# Load a local .env if present (for the optional Gemini key). Values already
# set in the real environment take precedence.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent

# Database URL. Defaults to local SQLite for development. In production set
# DATABASE_URL (e.g. a Render Postgres URL) so data survives restarts — Render's
# filesystem is ephemeral and a SQLite file there is wiped on every deploy.
DATABASE_URL = os.environ.get(
    "DATABASE_URL", f"sqlite:///{BASE_DIR / 'smart_workout_buddy.db'}"
)
# SQLAlchemy needs the 'postgresql://' scheme; Render/Heroku hand out
# 'postgres://'. Normalize it, and target the psycopg (v3) driver we install.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )

# Session lifetimes (seconds).
SESSION_TTL_DEFAULT = 60 * 60 * 8  # 8 hours
SESSION_TTL_REMEMBER = 60 * 60 * 24 * 30  # 30 days

SESSION_COOKIE_NAME = "swb_session"

# Whether the app is served over HTTPS on separate frontend/backend domains
# (i.e. the Vercel + Render setup). When true, the session cookie is sent as
# SameSite=None; Secure so the browser will include it on cross-site requests.
# Set COOKIE_CROSS_SITE=true in the Render environment for production.
COOKIE_CROSS_SITE = os.environ.get("COOKIE_CROSS_SITE", "false").lower() == "true"

# Allowed CORS origins. Comma-separated list from the CORS_ORIGINS env var, plus
# the local dev origin. Set CORS_ORIGINS on Render to your Vercel URL(s), e.g.
#   CORS_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
_env_origins = os.environ.get("CORS_ORIGINS", "")
CORS_ORIGINS = [o.strip() for o in _env_origins.split(",") if o.strip()] or [
    "http://localhost:5173"
]
if "http://localhost:5173" not in CORS_ORIGINS:
    CORS_ORIGINS.append("http://localhost:5173")

# Gemini API. The key is read from the environment and used ONLY server-side —
# it is never sent to the browser. If unset, the coach falls back to a local
# rules-based responder so the feature works without a key.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)
