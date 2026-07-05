"""Authentication endpoints backed by SQLite sessions."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.core.config import (
    COOKIE_CROSS_SITE,
    SESSION_COOKIE_NAME,
    SESSION_TTL_DEFAULT,
    SESSION_TTL_REMEMBER,
)
from app.core.deps import get_current_user
from app.core.security import (
    generate_session_token,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.models import Session as SessionModel
from app.models import User
from app.schemas.auth import (
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _create_session(db: DbSession, user: User, remember: bool) -> str:
    ttl = SESSION_TTL_REMEMBER if remember else SESSION_TTL_DEFAULT
    token = generate_session_token()
    session = SessionModel(
        token=token,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=ttl),
    )
    db.add(session)
    db.commit()
    return token


def _set_session_cookie(response: Response, token: str, remember: bool) -> None:
    max_age = SESSION_TTL_REMEMBER if remember else SESSION_TTL_DEFAULT
    # Cross-site (Vercel frontend + Render backend on different domains) requires
    # SameSite=None with Secure so the browser sends the cookie on API calls.
    # Locally (same-origin dev proxy over http) we use Lax + non-secure.
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=max_age,
        httponly=True,
        samesite="none" if COOKIE_CROSS_SITE else "lax",
        secure=COOKIE_CROSS_SITE,
    )


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(
    payload: RegisterRequest,
    response: Response,
    db: DbSession = Depends(get_db),
) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = _create_session(db, user, remember=False)
    _set_session_cookie(response, token, remember=False)
    return user


@router.post("/login", response_model=UserResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: DbSession = Depends(get_db),
) -> User:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(
        payload.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = _create_session(db, user, remember=payload.remember_me)
    _set_session_cookie(response, token, remember=payload.remember_me)
    return user


@router.post("/logout", response_model=MessageResponse)
def logout(
    response: Response,
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: DbSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> MessageResponse:
    """Invalidate the current session server-side and clear the cookie."""
    if session_token:
        session = db.scalar(
            select(SessionModel).where(SessionModel.token == session_token)
        )
        if session is not None:
            db.delete(session)
            db.commit()
    response.delete_cookie(
        SESSION_COOKIE_NAME,
        httponly=True,
        samesite="none" if COOKIE_CROSS_SITE else "lax",
        secure=COOKIE_CROSS_SITE,
    )
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
