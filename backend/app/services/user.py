from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from ..models import User, StudentTeacher, ParentChild, RoleEnum
from ..models import StudentProfile, TeacherProfile, ParentProfile
from ..schemas import UserCreate, UserProfileCreate, UserUpdate
# ...existing code...
from ..schemas import StudentProfileCreate, TeacherProfileCreate, ParentProfileCreate, StudentProfileUpdate
from ..schemas import TeacherProfileCreate  # Eğer TeacherProfileUpdate şeman varsa onu da ekle
from ..schemas import ParentProfileCreate  # Eğer ParentProfileUpdate şeman varsa onu da ekle

# Öğrenci-Öğretmen ilişki silme servisi
def delete_student_teacher_relation(db: Session, student_id: int, teacher_id: int):
    relation = db.query(StudentTeacher).filter(
        StudentTeacher.student_id == student_id,
        StudentTeacher.teacher_id == teacher_id
    ).first()
    if not relation:
        raise HTTPException(status_code=404, detail="İlişki bulunamadı")
    db.delete(relation)
    db.commit()
    return {"detail": "İlişki başarıyla silindi"}

# Öğrenci-Veli ilişki silme servisi
def delete_parent_child_relation(db: Session, parent_id: int, child_id: int):
    relation = db.query(ParentChild).filter(
        ParentChild.parent_id == parent_id,
        ParentChild.child_id == child_id
    ).first()
    if not relation:
        raise HTTPException(status_code=404, detail="İlişki bulunamadı")
    db.delete(relation)
    db.commit()
    return {"detail": "İlişki başarıyla silindi"}

# Öğrenci profili silme servisi
def delete_student_profile(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if db_user.role != RoleEnum.student:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir öğrenci değil")
    db_profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Öğrenci profili bulunamadı")
    db.delete(db_profile)
    db.commit()
    return {"detail": "Öğrenci profili başarıyla silindi"}

# Öğretmen profili silme servisi
def delete_teacher_profile(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if db_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir öğretmen değil")
    db_profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Öğretmen profili bulunamadı")
    db.delete(db_profile)
    db.commit()
    return {"detail": "Öğretmen profili başarıyla silindi"}

# Veli profili silme servisi
def delete_parent_profile(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if db_user.role != RoleEnum.parent:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir veli değil")
    db_profile = db.query(ParentProfile).filter(ParentProfile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Veli profili bulunamadı")
    db.delete(db_profile)
    db.commit()
    return {"detail": "Veli profili başarıyla silindi"}

# Öğretmen profili güncelleme servisi
def update_teacher_profile(db: Session, user_id: int, profile_update: TeacherProfileCreate):  # TeacherProfileUpdate şeman varsa onu kullan
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if db_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir öğretmen değil")
    db_profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Öğretmen profili bulunamadı")
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_profile, field):
            setattr(db_profile, field, value)
    db.commit()
    db.refresh(db_profile)
    return db_profile
# Öğrenci profili güncelleme servisi
def update_student_profile(db: Session, user_id: int, profile_update: StudentProfileUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if db_user.role != RoleEnum.student:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir öğrenci değil")
    db_profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Öğrenci profili bulunamadı")
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_profile, field):
            setattr(db_profile, field, value)
    db.commit()
    db.refresh(db_profile)
    return db_profile
from .auth import get_password_hash

# Kullanıcı oluşturma servisi
def create_user(db: Session, user: UserCreate):
    # Email kontrolü
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email zaten kullanımda")
    
    # Kullanıcı adı kontrolü
    db_username = db.query(User).filter(User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Kullanıcı adı zaten kullanımda")
    
    # Kullanıcı oluşturma
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Kullanıcı profili oluşturma servisi (DEPRECATED - Artık kullanılmıyor)
def create_user_profile(db: Session, profile: UserProfileCreate, user_id: int):
    # Bu fonksiyon artık kullanılmamaktadır.
    # Yerine rol-bazlı profil oluşturma fonksiyonları kullanılmalıdır.
    import warnings
    warnings.warn("create_user_profile fonksiyonu kaldırılmıştır. Lütfen rol bazlı profil fonksiyonlarını kullanın.", DeprecationWarning)
    
    # Eski UserProfile tablosu kaldırıldığı için bu fonksiyon artık çalışmaz
    raise HTTPException(
        status_code=410, 
        detail="Bu API kaldırılmıştır. Lütfen rol bazlı profil API'lerini kullanın."
    )

# Kullanıcı getirme servisi
def get_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Rol bazlı profilleri yükle (lazy loading)
    if db_user.role == RoleEnum.student:
        _ = db_user.student_profile
    elif db_user.role == RoleEnum.teacher:
        _ = db_user.teacher_profile
    elif db_user.role == RoleEnum.parent:
        _ = db_user.parent_profile
    
    return db_user

# Email ile kullanıcı getirme servisi
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Kullanıcı adı ile kullanıcı getirme servisi
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# Tüm kullanıcıları getirme servisi
def get_users(db: Session, skip: int = 0, limit: int = 100, role: Optional[RoleEnum] = None):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    
    # Rol bazlı profilleri yükle
    for user in users:
        if user.role == RoleEnum.student:
            _ = user.student_profile
        elif user.role == RoleEnum.teacher:
            _ = user.teacher_profile
        elif user.role == RoleEnum.parent:
            _ = user.parent_profile
    
    return users

# Kullanıcı güncelleme servisi
def update_user(db: Session, user_id: int, user_update: UserUpdate):
    # Kullanıcı kontrolü
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Güncellenecek alanları kontrol et
    update_data = user_update.dict(exclude_unset=True)
    
    # Email kontrolü (eğer güncelleniyorsa)
    if "email" in update_data and update_data["email"] != db_user.email:
        existing_email = db.query(User).filter(
            User.email == update_data["email"], 
            User.id != user_id
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Bu email zaten kullanımda")
    
    # Kullanıcı adı kontrolü (eğer güncelleniyorsa)
    if "username" in update_data and update_data["username"] != db_user.username:
        existing_username = db.query(User).filter(
            User.username == update_data["username"], 
            User.id != user_id
        ).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanımda")
    
    # Güncellemeleri uygula
    for field, value in update_data.items():
        if hasattr(db_user, field):
            setattr(db_user, field, value)
    
    # updated_at alanını güncelle
    from datetime import datetime
    db_user.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_user)
    return db_user

# Öğretmen-öğrenci ilişkisi oluşturma servisi
def create_student_teacher_relation(db: Session, student_id: int, teacher_id: int):
    # Kullanıcı kontrolü
    student = db.query(User).filter(User.id == student_id, User.role == RoleEnum.student).first()
    if not student:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")
    
    teacher = db.query(User).filter(User.id == teacher_id, User.role == RoleEnum.teacher).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")
    
    # İlişki kontrolü
    relation = db.query(StudentTeacher).filter(
        StudentTeacher.student_id == student_id,
        StudentTeacher.teacher_id == teacher_id
    ).first()
    
    if relation:
        raise HTTPException(status_code=400, detail="Bu ilişki zaten var")
    
    # İlişki oluşturma
    relation = StudentTeacher(student_id=student_id, teacher_id=teacher_id)
    db.add(relation)
    db.commit()
    return relation

# Ebeveyn-çocuk ilişkisi oluşturma servisi
def create_parent_child_relation(db: Session, parent_id: int, child_id: int):
    # Kullanıcı kontrolü
    parent = db.query(User).filter(User.id == parent_id, User.role == RoleEnum.parent).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Ebeveyn bulunamadı")
    
    child = db.query(User).filter(User.id == child_id, User.role == RoleEnum.student).first()
    if not child:
        raise HTTPException(status_code=404, detail="Çocuk bulunamadı")
    
    # İlişki kontrolü
    relation = db.query(ParentChild).filter(
        ParentChild.parent_id == parent_id,
        ParentChild.child_id == child_id
    ).first()
    
    if relation:
        raise HTTPException(status_code=400, detail="Bu ilişki zaten var")
    
    # İlişki oluşturma
    relation = ParentChild(parent_id=parent_id, child_id=child_id)
    db.add(relation)
    db.commit()
    return relation

# Öğretmenin öğrencilerini getirme servisi
def get_teacher_students(db: Session, teacher_id: int):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == RoleEnum.teacher).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")
    
    student_relations = db.query(StudentTeacher).filter(StudentTeacher.teacher_id == teacher_id).all()
    student_ids = [relation.student_id for relation in student_relations]
    
    students = db.query(User).filter(User.id.in_(student_ids)).all()
    return students

# Ebeveynin çocuklarını getirme servisi
def get_parent_children(db: Session, parent_id: int):
    parent = db.query(User).filter(User.id == parent_id, User.role == RoleEnum.parent).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Ebeveyn bulunamadı")
    child_relations = db.query(ParentChild).filter(ParentChild.parent_id == parent_id).all()
    child_ids = [relation.child_id for relation in child_relations]
    if not child_ids:
        return []
    children = db.query(User).filter(User.id.in_(child_ids)).all()
    return children

# Veli profili güncelleme servisi
def update_parent_profile(db: Session, user_id: int, profile_update: ParentProfileCreate):  # ParentProfileUpdate şeman varsa onu kullan
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if db_user.role != RoleEnum.parent:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir veli değil")
    db_profile = db.query(ParentProfile).filter(ParentProfile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Veli profili bulunamadı")
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_profile, field):
            setattr(db_profile, field, value)
    db.commit()
    db.refresh(db_profile)
    return db_profile
    parent = db.query(User).filter(User.id == parent_id, User.role == RoleEnum.parent).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Ebeveyn bulunamadı")
    
    child_relations = db.query(ParentChild).filter(ParentChild.parent_id == parent_id).all()
    child_ids = [relation.child_id for relation in child_relations]
    
    children = db.query(User).filter(User.id.in_(child_ids)).all()
    return children

# Öğrenci profili oluşturma servisi
def create_student_profile(db: Session, profile: StudentProfileCreate, user_id: int):
    # Kullanıcı kontrolü
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Rol kontrolü
    if db_user.role != RoleEnum.student:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir öğrenci değil")
    
    # Profil kontrolü
    db_profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if db_profile:
        raise HTTPException(status_code=400, detail="Öğrencinin zaten bir profili var")
    
    # Profil oluşturma
    db_profile = StudentProfile(
        user_id=user_id,
        age=profile.age,
        dyslexia_level=profile.dyslexia_level,
        additional_info=profile.additional_info
    )
    
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# Öğretmen profili oluşturma servisi
def create_teacher_profile(db: Session, profile: TeacherProfileCreate, user_id: int):
    # Kullanıcı kontrolü
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Rol kontrolü
    if db_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir öğretmen değil")
    
    # Profil kontrolü
    db_profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == user_id).first()
    if db_profile:
        raise HTTPException(status_code=400, detail="Öğretmenin zaten bir profili var")
    
    # Profil oluşturma
    db_profile = TeacherProfile(
        user_id=user_id,
        specialization=profile.specialization,
        dyslexia_approach=profile.dyslexia_approach,
        experience_years=profile.experience_years,
        qualifications=profile.qualifications,
        additional_info=profile.additional_info
    )
    
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# Veli profili oluşturma servisi
def create_parent_profile(db: Session, profile: ParentProfileCreate, user_id: int):
    # Kullanıcı kontrolü
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Rol kontrolü
    if db_user.role != RoleEnum.parent:
        raise HTTPException(status_code=400, detail="Bu kullanıcı bir veli değil")
    
    # Profil kontrolü
    db_profile = db.query(ParentProfile).filter(ParentProfile.user_id == user_id).first()
    if db_profile:
        raise HTTPException(status_code=400, detail="Velinin zaten bir profili var")
    
    # Profil oluşturma
    db_profile = ParentProfile(
        user_id=user_id,
        relationship_type=profile.relationship_type,
        additional_info=profile.additional_info
    )
    
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile
