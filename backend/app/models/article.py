import uuid

from sqlalchemy import ForeignKey, Text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin


class Article(
    Base,
    UUIDMixin,
    TimestampMixin,
):
    __tablename__ = "articles"

    display_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    creator_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    primary_image_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("images.id"),
        nullable=True,
    )

    background_image_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("images.id"),
        nullable=True,
    )

    creator = relationship("User")

    primary_image = relationship(
        "Image",
        foreign_keys=[primary_image_id],
    )

    background_image = relationship(
        "Image",
        foreign_keys=[background_image_id],
    )
