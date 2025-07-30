from sqlalchemy.orm import Session
from ..models.models import StudentWordDifficulty

def add_or_increment_zor_kelime(db: Session, student_id: int, kelime: str):
    kayit = db.query(StudentWordDifficulty).filter_by(student_id=student_id, kelime=kelime).first()
    if kayit:
        kayit.tekrar_sayisi += 1
        db.commit()
        db.refresh(kayit)
    else:
        kayit = StudentWordDifficulty(student_id=student_id, kelime=kelime, tekrar_sayisi=1)
        db.add(kayit)
        db.commit()
        db.refresh(kayit)
    return kayit

def get_student_zor_kelimeler(db: Session, student_id: int):
    return db.query(StudentWordDifficulty).filter_by(student_id=student_id).all()
