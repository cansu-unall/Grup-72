"""Add admin role to RoleEnum

Revision ID: d2d115d336f7
Revises: 2fd41036d4a3
Create Date: 2025-07-11 11:35:43.212273

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2d115d336f7'
down_revision: Union[str, Sequence[str], None] = '2fd41036d4a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # PostgreSQL'de enum tipine yeni bir değer ekleme
    op.execute("ALTER TYPE roleenum ADD VALUE IF NOT EXISTS 'admin'")


def downgrade() -> None:
    """Downgrade schema."""
    # PostgreSQL'de enum değerini kaldırmak doğrudan desteklenmiyor
    # Bu nedenle downgrade işleminde değer kaldırma yok
    pass
