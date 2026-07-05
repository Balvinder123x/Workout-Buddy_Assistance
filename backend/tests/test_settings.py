"""Tests for profile settings, export, and account deletion."""
from fastapi.testclient import TestClient


def _register(client: TestClient, email: str = "s@b.com") -> None:
    client.post(
        "/api/auth/register",
        json={"email": email, "full_name": "S", "password": "password123"},
    )


def _log(client: TestClient) -> None:
    client.post(
        "/api/workouts",
        json={
            "exercise_id": "squat",
            "reps": 10,
            "duration_sec": 60,
            "calories": 30,
            "quality_score": 85,
        },
    )


def test_get_profile_default(client: TestClient) -> None:
    _register(client)
    resp = client.get("/api/settings/profile")
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "s@b.com"
    assert body["bmi"] is None  # no height/weight yet


def test_update_profile_and_bmi(client: TestClient) -> None:
    _register(client)
    resp = client.patch(
        "/api/settings/profile",
        json={"full_name": "New Name", "height_cm": 180, "weight_kg": 81},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["full_name"] == "New Name"
    # BMI = 81 / 1.8^2 = 25.0
    assert body["bmi"] == 25.0


def test_export_json(client: TestClient) -> None:
    _register(client)
    _log(client)
    resp = client.get("/api/settings/export?fmt=json")
    assert resp.status_code == 200
    assert "attachment" in resp.headers["content-disposition"]
    assert len(resp.json()["workouts"]) == 1


def test_export_csv(client: TestClient) -> None:
    _register(client)
    _log(client)
    resp = client.get("/api/settings/export?fmt=csv")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    assert "exercise_id" in resp.text
    assert "squat" in resp.text


def test_delete_account_requires_confirmation(client: TestClient) -> None:
    _register(client)
    resp = client.request(
        "DELETE", "/api/settings/account", json={"confirm": "nope"}
    )
    assert resp.status_code == 400


def test_delete_account_cascades(client: TestClient) -> None:
    _register(client)
    _log(client)
    # Delete the account.
    resp = client.request(
        "DELETE", "/api/settings/account", json={"confirm": "DELETE"}
    )
    assert resp.status_code == 204
    # The session cookie is cleared, so /me should now be unauthorized.
    client.cookies.clear()
    assert client.get("/api/auth/me").status_code == 401
    # Re-registering with the same email should work (user was fully removed).
    again = client.post(
        "/api/auth/register",
        json={"email": "s@b.com", "full_name": "S", "password": "password123"},
    )
    assert again.status_code == 201
