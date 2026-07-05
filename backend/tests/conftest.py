"""Shared test fixtures: an isolated temporary SQLite database per test."""
import tempfile
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401 - ensure all models register on Base
from app.db.database import Base, get_db
from app.main import app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    tmp.close()
    engine = create_engine(
        f"sqlite:///{tmp.name}", connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(
        bind=engine, autoflush=False, autocommit=False
    )
    Base.metadata.create_all(bind=engine)

    def _override_get_db() -> Generator:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Path(tmp.name).unlink(missing_ok=True)
