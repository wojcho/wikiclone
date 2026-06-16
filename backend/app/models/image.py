from sqlalchemy import LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector

from .base import Base, UUIDMixin, TimestampMixin


class Image(
    Base,
    UUIDMixin,
    TimestampMixin,
):
    __tablename__ = "images"

    display_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    content_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    data: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
    )

    embedding: Mapped[list[float]] = mapped_column(
        Vector(512),  # appropriate for openai/clip-vit-base-patch32
        nullable=True,
    )
