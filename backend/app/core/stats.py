"""Shared workout-stats aggregation, reused by the stats endpoint and coach."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.core.gamification import (
    compute_badges,
    compute_streak,
    level_for_xp,
    xp_progress,
)
from app.models import Workout


def compute_user_stats(db: DbSession, user_id: int) -> dict:
    """Aggregate a user's workouts into the stats dict used across the app."""
    workouts = list(
        db.scalars(select(Workout).where(Workout.user_id == user_id)).all()
    )

    total_workouts = len(workouts)
    total_reps = sum(w.reps for w in workouts)
    total_calories = sum(w.calories for w in workouts)
    total_xp = sum(w.xp for w in workouts)
    best_quality = max((w.quality_score for w in workouts), default=0)
    avg_quality = (
        sum(w.quality_score for w in workouts) / total_workouts
        if total_workouts
        else 0.0
    )
    distinct_exercises = len({w.exercise_id for w in workouts})
    streak = compute_streak([w.created_at.date() for w in workouts])
    level = level_for_xp(total_xp)
    into, needed = xp_progress(total_xp)
    badges = compute_badges(
        total_workouts=total_workouts,
        total_reps=total_reps,
        streak=streak,
        best_quality=best_quality,
        distinct_exercises=distinct_exercises,
    )

    return {
        "total_workouts": total_workouts,
        "total_reps": total_reps,
        "total_calories": total_calories,
        "total_xp": total_xp,
        "level": level,
        "xp_into_level": into,
        "xp_for_level": needed,
        "streak": streak,
        "best_quality": best_quality,
        "avg_quality": round(avg_quality, 1),
        "distinct_exercises": distinct_exercises,
        "badges": badges,
    }
