from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from ..models import User, UserProfile, StudentTeacher, ParentChild, RoleEnum
from ..schemas import UserCreate, UserProfileCreate
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

# Kullanıcı profili oluşturma servisi
def create_user_profile(db: Session, profile: UserProfileCreate, user_id: int):
    # Kullanıcı kontrolü
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Profil kontrolü
    db_profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if db_profile:
        raise HTTPException(status_code=400, detail="Kullanıcının zaten bir profili var")
    
    # Profil oluşturma
    db_profile = UserProfile(
        user_id=user_id,
        age=profile.age,
        dyslexia_level=profile.dyslexia_level,
        additional_info=profile.additional_info
    )
    
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# Kullanıcı getirme servisi
def get_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
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
    return query.offset(skip).limit(limit).all()

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
    
    children = db.query(User).filter(User.id.in_(child_ids)).all()
    return children
