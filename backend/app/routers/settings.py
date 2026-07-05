"""Profile settings, data export, and account deletion."""
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.core.config import COOKIE_CROSS_SITE, SESSION_COOKIE_NAME
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models import Profile, User, Workout
from app.schemas.settings import (
    DeleteAccountRequest,
    ProfileRead,
    ProfileUpdate,
)

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _bmi(profile: Profile | None) -> float | None:
    if not profile or not profile.height_cm or not profile.weight_kg:
        return None
    h = profile.height_cm / 100
    return round(profile.weight_kg / (h * h), 1)


def _get_or_create_profile(db: DbSession, user: User) -> Profile:
    profile = db.scalar(select(Profile).where(Profile.user_id == user.id))
    if profile is None:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/profile", response_model=ProfileRead)
def get_profile(
    db: DbSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProfileRead:
    profile = _get_or_create_profile(db, user)
    return ProfileRead(
        full_name=user.full_name,
        email=user.email,
        age=profile.age,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        bmi=_bmi(profile),
    )


@router.patch("/profile", response_model=ProfileRead)
def update_profile(
    payload: ProfileUpdate,
    db: DbSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProfileRead:
    profile = _get_or_create_profile(db, user)

    if payload.full_name is not None:
        user.full_name = payload.full_name
    for field in ("age", "height_cm", "weight_kg", "goal"):
        value = getattr(payload, field)
        if value is not None:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return ProfileRead(
        full_name=user.full_name,
        email=user.email,
        age=profile.age,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        bmi=_bmi(profile),
    )


@router.get("/export")
def export_history(
    fmt: str = "json",
    db: DbSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    """Download the user's full workout history as JSON or CSV."""
    workouts = list(
        db.scalars(
            select(Workout)
            .where(Workout.user_id == user.id)
            .order_by(Workout.created_at.asc())
        ).all()
    )

    if fmt == "csv":
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(
            [
                "id",
                "exercise_id",
                "reps",
                "duration_sec",
                "calories",
                "quality_score",
                "xp",
                "created_at",
            ]
        )
        for w in workouts:
            writer.writerow(
                [
                    w.id,
                    w.exercise_id,
                    w.reps,
                    w.duration_sec,
                    w.calories,
                    w.quality_score,
                    w.xp,
                    w.created_at.isoformat(),
                ]
            )
        return Response(
            content=buf.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=workout_history.csv"
            },
        )

    # Default: JSON.
    data = [
        {
            "id": w.id,
            "exercise_id": w.exercise_id,
            "reps": w.reps,
            "duration_sec": w.duration_sec,
            "calories": w.calories,
            "quality_score": w.quality_score,
            "xp": w.xp,
            "created_at": w.created_at.isoformat(),
        }
        for w in workouts
    ]
    import json

    return Response(
        content=json.dumps({"workouts": data}, indent=2),
        media_type="application/json",
        headers={
            "Content-Disposition": "attachment; filename=workout_history.json"
        },
    )


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    payload: DeleteAccountRequest,
    response: Response,
    db: DbSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    """Permanently delete the account and all associated data."""
    if payload.confirm != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation text must be 'DELETE'",
        )
    # Cascades remove sessions, workouts, and profile.
    db.delete(user)
    db.commit()
    response.delete_cookie(
        SESSION_COOKIE_NAME,
        httponly=True,
        samesite="none" if COOKIE_CROSS_SITE else "lax",
        secure=COOKIE_CROSS_SITE,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
