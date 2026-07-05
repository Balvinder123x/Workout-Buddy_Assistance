"""Tests for workout logging, history, and stats endpoints."""
from fastapi.testclient import TestClient


def _register(client: TestClient, email: str = "w@b.com") -> None:
    client.post(
        "/api/auth/register",
        json={"email": email, "full_name": "W", "password": "password123"},
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


def test_create_requires_auth(client: TestClient) -> None:
    client.cookies.clear()
    assert _log(client).status_code == 401


def test_create_and_list(client: TestClient) -> None:
    _register(client)
    resp = _log(client)
    assert resp.status_code == 201
    body = resp.json()
    assert body["exercise_id"] == "squat"
    assert body["xp"] > 0  # XP computed server-side

    listing = client.get("/api/workouts")
    assert listing.status_code == 200
    assert len(listing.json()) == 1


def test_history_period_filter(client: TestClient) -> None:
    _register(client)
    _log(client)
    # All periods should include the just-created workout.
    for period in ("all", "day", "week", "month"):
        resp = client.get(f"/api/workouts?period={period}")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


def test_stats_aggregation(client: TestClient) -> None:
    _register(client)
    _log(client, "squat", reps=12, quality=90)
    _log(client, "pushup", reps=10, quality=80)

    stats = client.get("/api/workouts/stats").json()
    assert stats["total_workouts"] == 2
    assert stats["total_reps"] == 22
    assert stats["distinct_exercises"] == 2
    assert stats["streak"] == 1
    assert stats["total_xp"] > 0
    assert stats["level"] >= 1
    # First-workout badge should be earned.
    earned = {b["id"] for b in stats["badges"] if b["earned"]}
    assert "first-workout" in earned


def test_stats_empty_user(client: TestClient) -> None:
    _register(client)
    stats = client.get("/api/workouts/stats").json()
    assert stats["total_workouts"] == 0
    assert stats["streak"] == 0
    assert stats["level"] == 1
    assert all(not b["earned"] for b in stats["badges"])
