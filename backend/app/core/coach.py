"""AI coach service.

Builds a prompt grounded in the user's REAL workout stats and calls the Gemini
API server-side (the API key never leaves the backend). If no key is
configured, a local rules-based responder answers from the same stats so the
feature works end-to-end without external dependencies.
"""
from __future__ import annotations

import httpx

from app.core.config import GEMINI_API_KEY, GEMINI_URL

SYSTEM_PROMPT = (
    "You are Coach, a concise and encouraging AI fitness assistant inside the "
    "Smart Workout Buddy app. You help with workout advice, form tips, meal "
    "suggestions, recovery, and motivation. Keep answers practical and short "
    "(a few sentences). Use the user's real stats below to personalize advice. "
    "Never invent numbers that contradict the stats. If asked for medical "
    "advice, gently suggest consulting a professional."
)


def build_context(stats: dict) -> str:
    """Turn the user's real stats into a compact context block for the model."""
    lines = [
        "User's current stats:",
        f"- Total workouts: {stats.get('total_workouts', 0)}",
        f"- Current streak: {stats.get('streak', 0)} days",
        f"- Level: {stats.get('level', 1)} ({stats.get('total_xp', 0)} XP)",
        f"- Total reps logged: {stats.get('total_reps', 0)}",
        f"- Average form quality: {stats.get('avg_quality', 0)}/100",
        f"- Best form quality: {stats.get('best_quality', 0)}/100",
        f"- Distinct exercises tried: {stats.get('distinct_exercises', 0)}/5",
    ]
    return "\n".join(lines)


def is_gemini_enabled() -> bool:
    return bool(GEMINI_API_KEY)


async def ask_gemini(context: str, history: list[dict], message: str) -> str:
    """Call the Gemini API server-side and return the reply text."""
    contents = []
    # Prime with system prompt + grounded context as the first user turn.
    contents.append(
        {
            "role": "user",
            "parts": [{"text": f"{SYSTEM_PROMPT}\n\n{context}"}],
        }
    )
    contents.append(
        {"role": "model", "parts": [{"text": "Got it — I'll keep it personal and practical."}]}
    )
    for turn in history[-8:]:
        role = "user" if turn.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": turn.get("content", "")}]})
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = {"contents": contents}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError):
        return "I couldn't generate a response just now. Try rephrasing?"


def local_fallback(stats: dict, message: str) -> str:
    """Rules-based responder used when no Gemini key is configured.

    Answers from the user's real stats with helpful, templated guidance.
    Clearly a fallback — the app surfaces which mode is active.
    """
    msg = message.lower()
    streak = stats.get("streak", 0)
    workouts = stats.get("total_workouts", 0)
    avg_q = stats.get("avg_quality", 0)
    distinct = stats.get("distinct_exercises", 0)

    if any(w in msg for w in ("motivat", "encourage", "give up", "tired")):
        if streak > 0:
            return (
                f"You're on a {streak}-day streak — that consistency is the "
                "hardest part and you've already got it. Show up today, even "
                "for a short session, and keep the chain alive."
            )
        return (
            "Everyone starts somewhere. Do one small set today — momentum "
            "beats motivation, and the streak starts with a single workout."
        )

    if any(w in msg for w in ("meal", "eat", "food", "nutrition", "protein")):
        return (
            "For strength work, aim for protein at each meal (eggs, chicken, "
            "lentils, tofu, yogurt) and don't skip carbs around training — "
            "they fuel your sets. Hydrate well. This is general guidance, not "
            "a medical plan."
        )

    if any(w in msg for w in ("form", "technique", "quality")):
        if avg_q >= 80:
            return (
                f"Your average form quality is {avg_q}/100 — excellent. Keep "
                "focusing on full range of motion and a controlled tempo to "
                "hold that standard as you add reps."
            )
        return (
            f"Your average form quality is {avg_q}/100. Slow down the lowering "
            "phase, hit full depth/extension each rep, and keep movement "
            "symmetric — those three fixes lift the score fastest."
        )

    if any(w in msg for w in ("what should i", "recommend", "next", "plan", "train")):
        if distinct < 5:
            return (
                f"You've tried {distinct} of the 5 tracked exercises. Mixing in "
                "the ones you haven't done builds balanced strength — try a "
                "session with a new movement today."
            )
        return (
            "You've covered all five tracked exercises — nice range. Pick the "
            "two with your lowest rep counts and give them extra focus this "
            "week to even things out."
        )

    if any(w in msg for w in ("recover", "rest", "sore")):
        return (
            "Recovery is where progress sticks. If you're sore, do lighter "
            "movement and prioritize sleep and protein. A rest day won't break "
            f"your {streak}-day streak if you log even a short mobility session."
        )

    # Default summary answer.
    return (
        f"Here's where you stand: {workouts} workouts logged, a {streak}-day "
        f"streak, and {avg_q}/100 average form. Ask me about form, meals, "
        "recovery, motivation, or what to train next."
    )
