"""Pydantic schemas for workouts, history, and stats."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WorkoutCreate(BaseModel):
    exercise_id: str = Field(min_length=1, max_length=40)
    reps: int = Field(ge=0)
    duration_sec: int = Field(ge=0)
    calories: int = Field(ge=0)
    quality_score: int = Field(ge=0, le=100)


class WorkoutRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercise_id: str
    reps: int
    duration_sec: int
    calories: int
    quality_score: int
    xp: int
    created_at: datetime


class BadgeRead(BaseModel):
    id: str
    name: str
    description: str
    earned: bool


class StatsResponse(BaseModel):
    total_workouts: int
    total_reps: int
    total_calories: int
    total_xp: int
    level: int
    xp_into_level: int
    xp_for_level: int
    streak: int
    best_quality: int
    avg_quality: float
    distinct_exercises: int
    badges: list[BadgeRead]
