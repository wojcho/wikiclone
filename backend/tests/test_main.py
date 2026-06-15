from fastapi.testclient import TestClient

from app.main import app

from conftest import AuthClient

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


def test_update_user_display_name(auth_client):
    client = auth_client.create_user_and_login("u1", "secret").client

    user = client.get("/auth/me").json()

    user_id = user["id"]

    r = client.patch(
        f"/users/{user_id}",
        json={"display_name": "New Name"},
    )

    assert r.status_code == 200
    assert r.json()["display_name"] == "New Name"


def test_update_user_password(auth_client):
    client = auth_client.create_user_and_login("u2", "secret").client

    user = client.get("/auth/me").json()

    user_id = user["id"]

    r = client.patch(
        f"/users/{user_id}",
        json={"password": "new-secret"},
    )

    assert r.status_code == 200

    # verify password actually changed by re-login attempt
    login = client.post(
        "/auth/login",
        data={"username": "u2", "password": "new-secret"},
    )

    assert login.status_code == 200

def test_update_article_text(auth_client):
    client = auth_client.create_user_and_login("a1", "secret").client

    article = client.post(
        "/articles",
        json={
            "display_name": "Original",
            "text": "Old text",
        },
    ).json()

    article_id = article["id"]

    r = client.patch(
        f"/articles/{article_id}",
        json={"text": "Updated text"},
    )

    assert r.status_code == 200
    assert r.json()["text"] == "Updated text"


def test_update_article_display_name_and_text(auth_client):
    client = auth_client.create_user_and_login("a2", "secret").client

    article = client.post(
        "/articles",
        json={
            "display_name": "Old title",
            "text": "Old text",
        },
    ).json()

    article_id = article["id"]

    r = client.patch(
        f"/articles/{article_id}",
        json={
            "display_name": "New title",
            "text": "New text",
        },
    )

    assert r.status_code == 200
    body = r.json()

    assert body["display_name"] == "New title"
    assert body["text"] == "New text"


def test_update_article_images(auth_client):
    client = auth_client.create_user_and_login("a3", "secret").client

    # create image
    img = client.post(
        "/images",
        files={"file": ("img.png", b"bytes", "image/png")},
    ).json()

    article = client.post(
        "/articles",
        json={
            "display_name": "Article",
            "text": "Text",
        },
    ).json()

    article_id = article["id"]

    r = client.patch(
        f"/articles/{article_id}",
        json={"primary_image_id": img["id"]},
    )

    assert r.status_code == 200
    assert r.json()["primary_image"]["id"] == img["id"]

def test_cannot_update_other_user(auth_client):
    alice = auth_client.create_user_and_login("alice", "secret")
    bob = (AuthClient(TestClient(app))).create_user_and_login("bob", "secret")

    alice_client = alice.client

    bob_user = bob.client.get("/auth/me").json()

    r = alice_client.patch(
        f"/users/{bob_user['id']}",
        json={
            "display_name": "Hacked",
        },
    )

    assert r.status_code == 403
    assert r.json()["detail"] == "User can mutate only own profile"

    # verify unchanged
    r = alice_client.get(f"/users/{bob_user['id']}")
    assert r.status_code == 200
    assert r.json()["display_name"] != "Hacked"

def test_cannot_change_other_user_password(auth_client):
    alice = auth_client.create_user_and_login("alice_pw", "secret")
    bob = (AuthClient(TestClient(app))).create_user_and_login("bob_pw", "secret")

    alice_client = alice.client

    bob_user = bob.client.get("/auth/me").json()

    r = alice_client.patch(
        f"/users/{bob_user['id']}",
        json={
            "password": "hacked-password",
        },
    )

    assert r.status_code == 403

def test_cannot_delete_other_user(auth_client):
    alice = auth_client.create_user_and_login("alice_del", "secret")
    bob = (AuthClient(TestClient(app))).create_user_and_login("bob_del", "secret")

    alice_client = alice.client

    bob_user = bob.client.get("/auth/me").json()

    r = alice_client.delete(
        f"/users/{bob_user['id']}",
    )

    assert r.status_code == 403
    assert r.json()["detail"] == "User can mutate only own profile"

    # user should still exist
    r = alice_client.get(f"/users/{bob_user['id']}")
    assert r.status_code == 200

def test_delete_own_user(auth_client):
    session = auth_client.create_user_and_login("self_delete", "secret")

    client = session.client
    me = client.get("/auth/me").json()

    r = client.delete(f"/users/{me['id']}")

    assert r.status_code == 200
    assert r.json()["status"] == "deleted"

    r = client.get(f"/users/{me['id']}")
    assert r.status_code == 404
