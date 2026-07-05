"""Security helpers: password hashing and session tokens."""
import secrets

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def generate_session_token() -> str:
    """Return a cryptographically-random, URL-safe session token."""
    return secrets.token_urlsafe(32)
