"""Pytest fixtures for CodeSentinel AI backend testing."""

import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal, get_db

# Ensure database tables exist
init_db()


@pytest.fixture(scope="session")
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="function")
def db_session():
    """SQLAlchemy database session fixture."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
