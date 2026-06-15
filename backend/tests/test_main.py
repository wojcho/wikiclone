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

def test_create_and_get_article():
    # First create a user (needed for FK)
    user_payload = {
        "username": "article_user",
        "display_name": "Article User",
        "password": "secret",
    }

    user_resp = client.post("/users", json=user_payload)
    assert user_resp.status_code == 200
    user_id = user_resp.json()["id"]

    # Create article
    article_payload = {
        "display_name": "My Article",
        "text": "Hello world",
        "creator_id": user_id,
    }

    r = client.post("/articles", json=article_payload)
    assert r.status_code == 200

    article = r.json()
    article_id = article["id"]

    assert article["display_name"] == "My Article"
    assert article["creator_id"] == user_id

    # Fetch article
    r = client.get(f"/articles/{article_id}")
    assert r.status_code == 200

    fetched = r.json()
    assert fetched["id"] == article_id
    assert fetched["text"] == "Hello world"


def test_list_articles():
    r = client.get("/articles")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_upload_and_get_image_metadata():
    file_content = b"fake-image-bytes"

    r = client.post(
        "/images",
        files={"file": ("test.png", file_content, "image/png")},
    )
    assert r.status_code == 200

    image = r.json()
    image_id = image["id"]

    assert image["display_name"] == "test.png"
    assert image["content_type"] == "image/png"

    # Fetch metadata
    r = client.get(f"/images/{image_id}")
    assert r.status_code == 200
    assert r.json()["id"] == image_id


def test_get_image_raw():
    file_content = b"raw-image-bytes"

    r = client.post(
        "/images",
        files={"file": ("raw.bin", file_content, "application/octet-stream")},
    )
    assert r.status_code == 200

    image_id = r.json()["id"]

    r = client.get(f"/images/{image_id}/raw")
    assert r.status_code == 200
    assert r.content == file_content
    assert r.headers["content-type"] == "application/octet-stream"


def test_list_images():
    r = client.get("/images")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
