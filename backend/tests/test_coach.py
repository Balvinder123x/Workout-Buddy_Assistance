"""Tests for the AI coach chat (local fallback path, no API key)."""
from fastapi.testclient import TestClient


def _register(client: TestClient, email: str = "c@b.com") -> None:
    client.post(
        "/api/auth/register",
        json={"email": email, "full_name": "C", "password": "password123"},
    )


def _log(client: TestClient, exercise="squat", reps=12, quality=90):
    return client.post(
        "/api/workouts",
        json={
            "exercise_id": exercise,
            "reps": reps,
            "duration_sec": 60,
            "calories": 30,
            "quality_score": quality,
        },
    )


def test_coach_status(client: TestClient) -> None:
    resp = client.get("/api/coach/status")
    assert resp.status_code == 200
    assert "gemini_enabled" in resp.json()


def test_chat_requires_auth(client: TestClient) -> None:
    client.cookies.clear()
    resp = client.post("/api/coach/chat", json={"message": "hi", "history": []})
    assert resp.status_code == 401


def test_chat_local_fallback_grounded(client: TestClient) -> None:
    _register(client)
    _log(client)  # one squat, quality 90
    resp = client.post(
        "/api/coach/chat",
        json={"message": "How is my form?", "history": []},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["source"] == "local"  # no key configured in tests
    # Grounded: should reference the real average quality (90).
    assert "90" in body["reply"]


def test_chat_motivation_references_streak(client: TestClient) -> None:
    _register(client)
    _log(client)
    resp = client.post(
        "/api/coach/chat",
        json={"message": "I need some motivation", "history": []},
    )
    assert resp.status_code == 200
    assert "streak" in resp.json()["reply"].lower()


def test_chat_validates_empty_message(client: TestClient) -> None:
    _register(client)
    resp = client.post("/api/coach/chat", json={"message": "", "history": []})
    assert resp.status_code == 422
