from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from typing import List, Optional

from ..models import Activity, User, RoleEnum, StudentTeacher
from ..schemas import ActivityCreate, ActivityUpdate, ActivityRead
from ..schemas import AktiviteTamamlaRequest

# Aktivite oluşturma servisi
def create_activity(db: Session, activity: ActivityCreate):
    # Öğrenci kontrolü
    student = db.query(User).filter(User.id == activity.student_id, User.role == RoleEnum.student).first()
    if not student:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")
    
    # Aktivite oluşturma
    db_activity = Activity(
        student_id=activity.student_id,
        activity_type=activity.activity_type,
        title=activity.title,
        description=activity.description,
        content=activity.content,
        difficulty_level=activity.difficulty_level
    )
    
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

# Aktivite getirme servisi
def get_activity(db: Session, activity_id: int):
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Aktivite bulunamadı")
    return db_activity

# Öğrencinin tüm aktivitelerini getirme servisi
def get_student_activities(db: Session, student_id: int, skip: int = 0, limit: int = 100, 
                          completed: Optional[bool] = None):
    # Öğrenci kontrolü
    student = db.query(User).filter(User.id == student_id, User.role == RoleEnum.student).first()
    if not student:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")
    
    # Aktiviteleri sorgulama
    query = db.query(Activity).filter(Activity.student_id == student_id)
    
    if completed is not None:
        query = query.filter(Activity.completed == completed)
    
    activities = query.offset(skip).limit(limit).all()
    return activities

# Aktivite güncelleme servisi
def update_activity(db: Session, activity_id: int, activity_update: ActivityUpdate):
    # Aktivite kontrolü
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Aktivite bulunamadı")
    
    # Tamamlandı durumu değişirse, tamamlandı tarihini güncelle
    if activity_update.completed is not None and db_activity.completed != activity_update.completed:
        if activity_update.completed:
            db_activity.completed_at = datetime.now()
        else:
            db_activity.completed_at = None
    
    # Güncellenen alanları ayarla
    update_data = activity_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_activity, key, value)
    
    db.commit()
    db.refresh(db_activity)
    return db_activity

# Aktivite silme servisi
def delete_activity(db: Session, activity_id: int):
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Aktivite bulunamadı")
    
    db.delete(db_activity)
    db.commit()
    return {"detail": "Aktivite başarıyla silindi"}

# Öğretmenin kendi ilişkili öğrencileri için oluşturduğu aktiviteleri listeleyen servis
def get_teacher_activities(db: Session, teacher_id: int) -> List[ActivityRead]:
    # Öğretmenin ilişkili olduğu öğrencileri bul
    student_ids = db.query(StudentTeacher.student_id).filter(StudentTeacher.teacher_id == teacher_id).all()
    student_ids = [sid[0] for sid in student_ids]
    if not student_ids:
        return []
    # Öğretmenin oluşturduğu aktiviteleri getir
    activities = db.query(Activity).filter(Activity.student_id.in_(student_ids)).all()
    return activities

# Öğretmenin aktivitelerinde dinamik arama servisi
def search_teacher_activities(
    db: Session,
    teacher_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    difficulty_level: Optional[int] = None
) -> List[Activity]:
    # Öğretmenin ilişkili olduğu öğrencileri bul
    student_ids = db.query(StudentTeacher.student_id).filter(StudentTeacher.teacher_id == teacher_id).all()
    student_ids = [sid[0] for sid in student_ids]
    if not student_ids:
        return []
    query = db.query(Activity).filter(Activity.student_id.in_(student_ids))
    if title is not None and title.strip() != "":
        query = query.filter(Activity.title.ilike(f"%{title.strip()}%"))
    if description is not None and description.strip() != "":
        query = query.filter(Activity.description.ilike(f"%{description.strip()}%"))
    if difficulty_level is not None:
        query = query.filter(Activity.difficulty_level == difficulty_level)
    return query.all()

# Öğrenci ilerleme raporu servisi
def get_student_progress_report(db: Session, student_id: int):
    # Öğrenciye ait aktiviteleri getir
    activities = db.query(Activity).filter(Activity.student_id == student_id).order_by(Activity.created_at.desc()).all()
    if not activities:
        return None

    tamamlanan = [a for a in activities if a.completed]
    skorlar = [a.score for a in tamamlanan if a.score is not None]

    toplam_tamamlanan = len(tamamlanan)
    ortalama_skor = sum(skorlar) / len(skorlar) if skorlar else None
    en_yuksek_skor = max(skorlar) if skorlar else None
    en_dusuk_skor = min(skorlar) if skorlar else None

    # Son 10 aktivite
    son_10 = activities[:10]
    progress_over_time = [
        {
            "id": a.id,
            "created_at": a.created_at,
            "score": a.score,
            "difficulty_level": a.difficulty_level
        }
        for a in son_10
    ]

    return {
        "total_completed": toplam_tamamlanan,
        "average_score": ortalama_skor,
        "max_score": en_yuksek_skor,
        "min_score": en_dusuk_skor,
        "progress_over_time": progress_over_time
    }

# Öğrencinin kendi aktivitesini tamamlaması için servis
def complete_activity_by_student(db: Session, activity_id: int, user_id: int, tamamla_data: AktiviteTamamlaRequest):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Aktivite bulunamadı")
    if activity.student_id != user_id:
        raise HTTPException(status_code=403, detail="Sadece kendi aktivitenizi tamamlayabilirsiniz.")
    if activity.completed:
        raise HTTPException(status_code=400, detail="Bu aktivite zaten tamamlanmış.")

    activity.completed = True
    activity.feedback = tamamla_data.feedback
    activity.completed_at = datetime.now()

    # Otomatik skor hesaplama (örnek: quiz için)
    if activity.activity_type == "quiz":
        activity.score = calculate_quiz_score(activity)
    else:
        activity.score = None

    db.commit()
    db.refresh(activity)
    return activity

# Otomatik skor hesaplama fonksiyonu
def calculate_quiz_score(activity):
    # Quiz cevapları ve doğru cevaplar karşılaştırılır
    # Cevaplar JSON string olarak tutuluyor
    import json
    try:
        student_answers = json.loads(activity.student_answers) if activity.student_answers else []
        correct_answers = json.loads(activity.correct_answers) if activity.correct_answers else []
    except Exception:
        return 0
    if not student_answers or not correct_answers or len(correct_answers) != 5:
        return 0
    dogru_sayisi = sum(1 for s, c in zip(student_answers, correct_answers) if s == c)
    skor = int((dogru_sayisi / 5) * 100)
    return skor
