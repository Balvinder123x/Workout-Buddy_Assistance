"""Smart Workout Buddy API.

Local FastAPI app backed by SQLite. Phase 2 adds session-based authentication.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.db.database import init_db
from app.routers import auth, coach, settings, workout


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Smart Workout Buddy API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(workout.router)
app.include_router(coach.router)
app.include_router(settings.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Liveness probe used by the frontend to confirm the API is running."""
    return {"status": "ok", "service": "smart-workout-buddy"}
