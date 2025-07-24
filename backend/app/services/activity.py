from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from typing import List, Optional

from ..models import Activity, User, RoleEnum, StudentTeacher
from ..schemas import ActivityCreate, ActivityUpdate, ActivityRead

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
