from fastapi import Depends
from app.security.dependencies import get_current_user
from app.models.user import User


def require_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
