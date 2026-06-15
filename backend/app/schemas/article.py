from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from .image import ImageRead

class ArticleCreate(BaseModel):
    display_name: str
    text: str
    primary_image_id: UUID | None = None
    background_image_id: UUID | None = None


class ArticleRead(BaseModel):
    id: UUID
    display_name: str
    text: str
    creator_id: UUID
    created_at: datetime
    updated_at: datetime

    primary_image: ImageRead | None
    background_image: ImageRead | None

    model_config = {
        "from_attributes": True
    }
