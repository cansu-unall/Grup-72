from sqlalchemy.orm import Session
from ..models.models import StudentWordDifficulty

def add_or_update_word_difficulty(db: Session, student_id: int, kelime: str) -> dict:
    # Kelime zaten kayıtlı mı kontrol et
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
    return {
        "student_id": kayit.student_id,
        "kelime": kayit.kelime,
        "tekrar_sayisi": kayit.tekrar_sayisi
    }
