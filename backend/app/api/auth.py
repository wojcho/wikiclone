from fastapi import APIRouter, Depends, HTTPException, Response, Form
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.security.passwords import verify_password
from app.security.jwt import create_access_token
from app.security.dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(
    response: Response,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # set True in production (HTTPS)
    )

    return {"message": "logged in", "token_type": "cookie"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "display_name": current_user.display_name,
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "logged out"}
