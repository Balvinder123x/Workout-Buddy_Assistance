"""Gamification: XP, streaks, levels, and badges derived from real workouts.

All of these are computed from logged workout rows — nothing is mocked. The
formulas are simple and explainable:

  - XP per workout  = reps * 2 + round(quality_score / 10) * 5
  - Level           = floor(sqrt(total_xp / 100)) + 1  (gentle curve)
  - Streak          = consecutive calendar days (up to today) with >=1 workout
  - Badges          = threshold checks on real totals
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, timedelta


def xp_for_workout(reps: int, quality_score: int) -> int:
    """XP earned for a single workout."""
    return reps * 2 + round(quality_score / 10) * 5


def level_for_xp(total_xp: int) -> int:
    """Level from total XP (square-root curve so levels slow down)."""
    return int(math.floor(math.sqrt(max(0, total_xp) / 100))) + 1


def xp_progress(total_xp: int) -> tuple[int, int]:
    """Return (xp_into_level, xp_needed_for_next_level)."""
    level = level_for_xp(total_xp)
    current_floor = (level - 1) ** 2 * 100
    next_floor = level**2 * 100
    return total_xp - current_floor, next_floor - current_floor


def compute_streak(workout_dates: list[date], today: date | None = None) -> int:
    """Consecutive-day streak ending today (or yesterday if none today)."""
    if not workout_dates:
        return 0
    today = today or date.today()
    days = set(workout_dates)

    # Streak counts back from today; if nothing today, allow it to start
    # yesterday so an in-progress day doesn't break the streak.
    start = today if today in days else today - timedelta(days=1)
    if start not in days:
        return 0

    streak = 0
    cursor = start
    while cursor in days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


@dataclass(frozen=True)
class Badge:
    id: str
    name: str
    description: str
    earned: bool


def compute_badges(
    total_workouts: int,
    total_reps: int,
    streak: int,
    best_quality: int,
    distinct_exercises: int,
) -> list[Badge]:
    """Evaluate badge criteria against real aggregate stats."""
    defs = [
        ("first-workout", "First Steps", "Complete your first workout",
         total_workouts >= 1),
        ("ten-workouts", "Getting Consistent", "Complete 10 workouts",
         total_workouts >= 10),
        ("fifty-workouts", "Dedicated", "Complete 50 workouts",
         total_workouts >= 50),
        ("hundred-reps", "Century", "Log 100 total reps",
         total_reps >= 100),
        ("thousand-reps", "Rep Machine", "Log 1000 total reps",
         total_reps >= 1000),
        ("streak-3", "On a Roll", "Reach a 3-day streak", streak >= 3),
        ("streak-7", "Week Warrior", "Reach a 7-day streak", streak >= 7),
        ("streak-30", "Unstoppable", "Reach a 30-day streak", streak >= 30),
        ("perfect-form", "Textbook", "Score 90+ on form",
         best_quality >= 90),
        ("all-rounder", "All-Rounder", "Try all 5 tracked exercises",
         distinct_exercises >= 5),
    ]
    return [Badge(i, n, d, bool(e)) for (i, n, d, e) in defs]
