from sqlalchemy import LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

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
