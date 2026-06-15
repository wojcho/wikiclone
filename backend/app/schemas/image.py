from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ImageRead(BaseModel):
    id: UUID
    display_name: str
    content_type: str

    model_config = {
        "from_attributes": True
    }
