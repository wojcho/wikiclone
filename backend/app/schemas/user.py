from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from .image import ImageRead

class UserCreate(BaseModel):
    username: str
    display_name: str
    password: str


class UserRead(BaseModel):
    id: UUID
    username: str
    display_name: str
    created_at: datetime
    updated_at: datetime

    avatar: ImageRead | None

    model_config = {
        "from_attributes": True
    }
