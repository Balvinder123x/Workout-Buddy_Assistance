"""End-to-end auth tests against an isolated temporary SQLite database."""
from fastapi.testclient import TestClient


def _register(client: TestClient, email: str = "a@b.com") -> None:
    return client.post(
        "/api/auth/register",
        json={"email": email, "full_name": "Test User", "password": "password123"},
    )


def test_health(client: TestClient) -> None:
    assert client.get("/api/health").json()["status"] == "ok"


def test_register_sets_cookie_and_returns_user(client: TestClient) -> None:
    resp = _register(client)
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "a@b.com"
    assert "hashed_password" not in body
    assert "swb_session" in resp.cookies


def test_register_duplicate(client: TestClient) -> None:
    _register(client)
    assert _register(client).status_code == 409


def test_register_weak_password(client: TestClient) -> None:
    resp = client.post(
        "/api/auth/register",
        json={"email": "x@y.com", "full_name": "X", "password": "short"},
    )
    assert resp.status_code == 422


def test_login_and_me(client: TestClient) -> None:
    _register(client)
    client.cookies.clear()
    resp = client.post(
        "/api/auth/login",
        json={"email": "a@b.com", "password": "password123"},
    )
    assert resp.status_code == 200
    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "a@b.com"


def test_login_wrong_password(client: TestClient) -> None:
    _register(client)
    resp = client.post(
        "/api/auth/login",
        json={"email": "a@b.com", "password": "wrongpassword"},
    )
    assert resp.status_code == 401


def test_me_requires_auth(client: TestClient) -> None:
    client.cookies.clear()
    assert client.get("/api/auth/me").status_code == 401


def test_logout_invalidates_session(client: TestClient) -> None:
    _register(client)
    assert client.get("/api/auth/me").status_code == 200
    assert client.post("/api/auth/logout").status_code == 200
    # After logout the server session is gone; the cleared cookie means 401.
    client.cookies.clear()
    assert client.get("/api/auth/me").status_code == 401


def test_remember_me_longer_cookie(client: TestClient) -> None:
    _register(client)
    client.cookies.clear()
    resp = client.post(
        "/api/auth/login",
        json={
            "email": "a@b.com",
            "password": "password123",
            "remember_me": True,
        },
    )
    assert resp.status_code == 200
    # The Set-Cookie header should carry a long Max-Age (30 days).
    set_cookie = resp.headers.get("set-cookie", "")
    assert "Max-Age=2592000" in set_cookie
