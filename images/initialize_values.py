import os
import glob
import random
import requests
from uuid import uuid4

BASE_URL = "http://localhost:8000"

USERS = [
    {"username": "alice", "display_name": "Alice A", "password": "password1"},
    {"username": "bob", "display_name": "Bob B", "password": "password2"},
    {"username": "carol", "display_name": "Carol C", "password": "password3"},
]

session_by_user = {}
user_ids = {}
image_ids = []


def guess_mime_type(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()

    if ext == ".jpg" or ext == ".jpeg":
        return "image/jpeg"
    if ext == ".png":
        return "image/png"

    return "application/octet-stream"

def create_user(user):
    r = requests.post(f"{BASE_URL}/users", json=user)
    r.raise_for_status()
    data = r.json()
    return data["id"]


def login_session(username, password):
    s = requests.Session()
    r = s.post(
        f"{BASE_URL}/auth/login",
        data={"username": username, "password": password},
    )
    r.raise_for_status()
    return s


def upload_images(session):
    files = glob.glob("*.png") + glob.glob("*.jpg")

    uploaded_ids = []

    for path in files:
        mime_type = guess_mime_type(path)

        with open(path, "rb") as f:
            r = session.post(
                f"{BASE_URL}/images",
                files={
                    "file": (
                        os.path.basename(path),
                        f,
                        mime_type
                    )
                },
            )

        r.raise_for_status()
        uploaded_ids.append(r.json()["id"])

    return uploaded_ids


def create_article(session, title, text, primary_image_id=None, background_image_id=None):
    payload = {
        "display_name": title,
        "text": text,
        "primary_image_id": primary_image_id,
        "background_image_id": background_image_id,
    }

    r = session.post(f"{BASE_URL}/articles", json=payload)
    r.raise_for_status()
    return r.json()


def patch_user_avatar(session, user_id, avatar_id):
    payload = {"avatar_id": avatar_id}
    r = session.patch(f"{BASE_URL}/users/{user_id}", json=payload)
    r.raise_for_status()
    return r.json()


def main():
    global image_ids

    # Create users
    for u in USERS:
        user_id = create_user(u)
        user_ids[u["username"]] = user_id

    # Login sessions
    for u in USERS:
        session_by_user[u["username"]] = login_session(u["username"], u["password"])

    # Pick uploader (first user)
    uploader = session_by_user[USERS[0]["username"]]
    image_ids = upload_images(uploader)

    print(f"Uploaded {len(image_ids)} images")

    # Create articles per user
    for u in USERS:
        s = session_by_user[u["username"]]

        for i in range(2):
            title = f"{u['username']} article {i}"

            text = f"""
# {title}

This is a markdown article created for {u['username']}.

- It supports **markdown**
- It includes an image reference

![example](image-placeholder)

Random UUID: {uuid4()}
"""

            primary = random.choice(image_ids) if image_ids else None
            background = random.choice(image_ids) if image_ids else None

            create_article(s, title, text, primary, background)

    # Assign random avatars to some users
    if image_ids:
        for u in USERS:
            if random.random() < 0.7: # 70% chance
                avatar = random.choice(image_ids)
                s = session_by_user[u["username"]]
                patch_user_avatar(s, user_ids[u["username"]], avatar)

    print("Done.")


if __name__ == "__main__":
    main()
