"""
Aktivite tablosuna quiz için cevap alanları ekleniyor

Revision ID: auto_add_quiz_answers
Revises: c2d1ea1f44e7
Create Date: 2025-07-24
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'auto_add_quiz_answers'
down_revision = 'c2d1ea1f44e7'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('activities', sa.Column('student_answers', sa.Text(), nullable=True))
    op.add_column('activities', sa.Column('correct_answers', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('activities', 'student_answers')
    op.drop_column('activities', 'correct_answers')
