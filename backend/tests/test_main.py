from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/health")

    assert response.status_code == 200

    body = response.json()

    assert "database_version" in body
    assert "PostgreSQL" in body["database_version"]
