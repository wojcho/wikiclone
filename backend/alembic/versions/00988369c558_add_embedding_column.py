"""add embedding column

Revision ID: 00988369c558
Revises: a27626dd0d30
Create Date: 2026-06-16 02:59:33.776460

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector


# revision identifiers, used by Alembic.
revision: str = '00988369c558'
down_revision: Union[str, Sequence[str], None] = 'a27626dd0d30'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('images', sa.Column('embedding', pgvector.sqlalchemy.vector.VECTOR(dim=512), nullable=True))
    op.execute("""
    CREATE INDEX image_embedding_hnsw_idx
    ON images
    USING hnsw (embedding vector_cosine_ops)
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('images', 'embedding')
    op.execute("DROP INDEX IF EXISTS image_embedding_hnsw_idx")
