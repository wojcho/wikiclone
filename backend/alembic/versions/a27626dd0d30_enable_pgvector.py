"""enable pgvector

Revision ID: a27626dd0d30
Revises: 9659dcbabe62
Create Date: 2026-06-16 01:50:31.889441

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a27626dd0d30'
down_revision: Union[str, Sequence[str], None] = '9659dcbabe62'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

def downgrade():
    op.execute("DROP EXTENSION IF EXISTS vector")
