"""AI coach chat endpoint."""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession

from app.core.coach import (
    ask_gemini,
    build_context,
    is_gemini_enabled,
    local_fallback,
)
from app.core.deps import get_current_user
from app.core.stats import compute_user_stats
from app.db.database import get_db
from app.models import User
from app.schemas.coach import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/coach", tags=["coach"])
logger = logging.getLogger("swb.coach")


@router.get("/status")
def coach_status() -> dict[str, bool]:
    """Report whether the Gemini-backed coach is available."""
    return {"gemini_enabled": is_gemini_enabled()}


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: DbSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ChatResponse:
    stats = compute_user_stats(db, user.id)
    # Drop non-serializable badge objects for the prompt context.
    stats_for_prompt = {k: v for k, v in stats.items() if k != "badges"}

    if is_gemini_enabled():
        try:
            context = build_context(stats_for_prompt)
            history = [t.model_dump() for t in payload.history]
            reply = await ask_gemini(context, history, payload.message)
            return ChatResponse(reply=reply, source="gemini")
        except Exception:  # noqa: BLE001 - fall back gracefully on any API error
            logger.exception("Gemini call failed; using local fallback")

    reply = local_fallback(stats_for_prompt, payload.message)
    return ChatResponse(reply=reply, source="local")
