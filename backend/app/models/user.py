from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin


class User(
    Base,
    UUIDMixin,
    TimestampMixin,
):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    display_name: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )

    avatar_id: Mapped[str | None] = mapped_column(
        ForeignKey("images.id"),
        nullable=True,
    )

    avatar = relationship("Image")
