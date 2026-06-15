import pytest
from fastapi.testclient import TestClient
import uuid

from app.main import app

client = TestClient(app)


@pytest.fixture
def test_client():
    return client

class AuthClient:
    def __init__(self, client: TestClient):
        self.client = client

    def create_user_and_login(self, username=None, password="secret"):
        if username is None:
            username = f"user_{uuid.uuid4().hex[:8]}"
        self.client.post(
            "/users",
            json={
                "username": username,
                "display_name": username,
                "password": password,
            },
        )

        r = self.client.post(
            "/auth/login",
            data={"username": username, "password": password},
        )

        assert r.status_code == 200
        return self

@pytest.fixture
def auth_client(test_client):
    return AuthClient(test_client)
