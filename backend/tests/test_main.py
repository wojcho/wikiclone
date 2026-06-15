from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/health")

    assert response.status_code == 200

    body = response.json()

    assert "database_version" in body
    assert "PostgreSQL" in body["database_version"]

def test_create_and_get_user():
    payload = {
        "username": "john",
        "display_name": "John Doe",
        "password": "secret",
    }

    r = client.post("/users", json=payload)
    assert r.status_code == 200
    user = r.json()

    user_id = user["id"]

    r = client.get(f"/users/{user_id}")
    assert r.status_code == 200
    assert r.json()["username"] == "john"
