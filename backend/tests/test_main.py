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

def test_create_and_get_article(auth_client):
    client = auth_client.create_user_and_login("article_user", "secret").client

    article_resp = client.post(
        "/articles",
        json={
            "display_name": "My Article",
            "text": "Hello world",
        },
    )

    assert article_resp.status_code == 200
    article = article_resp.json()
    article_id = article["id"]

    r = client.get(f"/articles/{article_id}")
    assert r.status_code == 200
    assert r.json()["text"] == "Hello world"


def test_list_articles():
    r = client.get("/articles")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_upload_and_get_image_metadata(auth_client):
    client = auth_client.create_user_and_login("article_user2", "secret").client

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


def test_get_image_raw(auth_client):
    client = auth_client.create_user_and_login("img_user", "secret").client

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


def test_login_me_and_logout_flow(auth_client):
    client = auth_client.create_user_and_login("jwt_user", "secret").client

    # me works
    me = client.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["username"] == "jwt_user"

    # logout
    logout = client.post("/auth/logout")
    assert logout.status_code == 200

    # now unauthorized
    me_after = client.get("/auth/me")
    assert me_after.status_code == 401
