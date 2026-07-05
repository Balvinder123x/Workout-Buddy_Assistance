"""Workout logging, history, and aggregated stats endpoints."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.core.deps import get_current_user
from app.core.gamification import xp_for_workout
from app.db.database import get_db
from app.models import User, Workout
from app.schemas.workout import (
    BadgeRead,
    StatsResponse,
    WorkoutCreate,
    WorkoutRead,
)

router = APIRouter(prefix="/api/workouts", tags=["workouts"])

Period = str  # "all" | "day" | "week" | "month"


def _period_start(period: Period) -> datetime | None:
    now = datetime.now(timezone.utc)
    if period == "day":
        return now - timedelta(days=1)
    if period == "week":
        return now - timedelta(days=7)
    if period == "month":
        return now - timedelta(days=30)
    return None


@router.post("", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
def create_workout(
    payload: WorkoutCreate,
    db: DbSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Workout:
    xp = xp_for_workout(payload.reps, payload.quality_score)
    workout = Workout(
        user_id=user.id,
        exercise_id=payload.exercise_id,
        reps=payload.reps,
        duration_sec=payload.duration_sec,
        calories=payload.calories,
        quality_score=payload.quality_score,
        xp=xp,
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.get("", response_model=list[WorkoutRead])
def list_workouts(
    period: Period = Query(default="all"),
    db: DbSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Workout]:
    stmt = select(Workout).where(Workout.user_id == user.id)
    start = _period_start(period)
    if start is not None:
        stmt = stmt.where(Workout.created_at >= start)
    stmt = stmt.order_by(Workout.created_at.desc())
    return list(db.scalars(stmt).all())


@router.get("/stats", response_model=StatsResponse)
def workout_stats(
    db: DbSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StatsResponse:
    from app.core.stats import compute_user_stats

    s = compute_user_stats(db, user.id)
    return StatsResponse(
        total_workouts=s["total_workouts"],
        total_reps=s["total_reps"],
        total_calories=s["total_calories"],
        total_xp=s["total_xp"],
        level=s["level"],
        xp_into_level=s["xp_into_level"],
        xp_for_level=s["xp_for_level"],
        streak=s["streak"],
        best_quality=s["best_quality"],
        avg_quality=s["avg_quality"],
        distinct_exercises=s["distinct_exercises"],
        badges=[BadgeRead(**b.__dict__) for b in s["badges"]],
    )
