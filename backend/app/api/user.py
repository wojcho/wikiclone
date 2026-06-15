from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.security.passwords import hash_password
from app.security.guards import require_user
from app.models.user import User


router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(
        username=payload.username,
        display_name=payload.display_name,
        password_hash=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: UUID,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="User can mutate only own profile")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    if payload.username is not None:
        user.username = payload.username

    if payload.display_name is not None:
        user.display_name = payload.display_name

    if payload.password is not None:
        user.password_hash = hash_password(payload.password)

    if payload.avatar_id is not None:
        user.avatar_id = payload.avatar_id

    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="User can mutate only own profile")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404)
    db.delete(user)
    db.commit()
    return {"status": "deleted"}
