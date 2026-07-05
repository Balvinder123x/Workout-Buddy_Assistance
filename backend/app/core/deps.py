"""Auth dependencies: resolve the current user from the session cookie."""
from datetime import datetime, timezone

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.core.config import SESSION_COOKIE_NAME
from app.db.database import get_db
from app.models import Session as SessionModel
from app.models import User


def get_current_user(
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: DbSession = Depends(get_db),
) -> User:
    """Return the authenticated user or raise 401.

    Validates the session token exists and has not expired. Expired sessions
    are deleted lazily on access.
    """
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )
    if not session_token:
        raise unauthorized

    session = db.scalar(
        select(SessionModel).where(SessionModel.token == session_token)
    )
    if session is None:
        raise unauthorized

    expires = session.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        db.delete(session)
        db.commit()
        raise unauthorized

    return session.user
