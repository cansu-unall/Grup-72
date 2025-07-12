"""remove_user_profiles_table

Revision ID: 2fd41036d4a3
Revises: 8c856ee186bd
Create Date: 2025-07-11 10:36:43.051702

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2fd41036d4a3'
down_revision: Union[str, Sequence[str], None] = '8c856ee186bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Eski profil tablosunu kaldır."""
    # İlişkili foreign key kısıtlamalarını kaldır
    op.drop_table('user_profiles')


def downgrade() -> None:
    """Downgrade schema: Eski profil tablosunu geri getir."""
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('dyslexia_level', sa.String(), nullable=True),
        sa.Column('additional_info', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_profiles_id'), 'user_profiles', ['id'], unique=False)
