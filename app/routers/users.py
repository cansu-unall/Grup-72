from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..services import (
    create_user, get_user, get_users, create_user_profile, 
    create_student_teacher_relation, create_parent_child_relation,
    get_teacher_students, get_parent_children,
    get_current_active_user, role_required
)
from ..schemas import (
    UserCreate, UserRead, UserProfileCreate, UserProfileRead, 
    StudentTeacherCreate, ParentChildCreate, Role
)
from ..models import User, RoleEnum
from ..database import get_db

router = APIRouter(
    prefix="/api/kullanicilar",
    tags=["kullanicilar"],
    responses={404: {"description": "Kullanıcı bulunamadı"}},
)

@router.post("/kayit", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Yeni kullanıcı kaydı oluştur
    """
    return create_user(db=db, user=user)

@router.get("/ben", response_model=UserRead)
def read_user_me(current_user: User = Depends(get_current_active_user)):
    """
    Giriş yapmış kullanıcının bilgilerini getir
    """
    return current_user

@router.get("/{user_id}", response_model=UserRead)
def read_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Kullanıcı bilgilerini getir
    """
    db_user = get_user(db, user_id=user_id)
    return db_user

@router.get("/", response_model=List[UserRead])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    role: Optional[Role] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.teacher, RoleEnum.parent]))
):
    """
    Kullanıcıları listele (Sadece öğretmenler ve ebeveynler)
    """
    users = get_users(db, skip=skip, limit=limit, role=role)
    return users

@router.post("/{user_id}/profil", response_model=UserProfileRead)
def create_profile_for_user(
    user_id: int,
    profile: UserProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Kullanıcı profili oluştur
    """
    # Sadece kendi profili veya yetkiliyse
    if current_user.id != user_id and current_user.role not in [RoleEnum.teacher, RoleEnum.parent]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Başka bir kullanıcı için profil oluşturamazsınız"
        )
    
    return create_user_profile(db=db, profile=profile, user_id=user_id)

@router.post("/ogrenci-ogretmen", status_code=status.HTTP_201_CREATED)
def create_student_teacher(
    relation: StudentTeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.teacher]))
):
    """
    Öğretmen-öğrenci ilişkisi oluştur (Sadece öğretmenler)
    """
    # Sadece kendi öğrencisi olarak ekleyebilir
    if current_user.id != relation.teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sadece kendinize öğrenci ekleyebilirsiniz"
        )
    
    return create_student_teacher_relation(db=db, student_id=relation.student_id, teacher_id=relation.teacher_id)

@router.post("/veli-cocuk", status_code=status.HTTP_201_CREATED)
def create_parent_child(
    relation: ParentChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.parent]))
):
    """
    Ebeveyn-çocuk ilişkisi oluştur (Sadece ebeveynler)
    """
    # Sadece kendi çocuğu olarak ekleyebilir
    if current_user.id != relation.parent_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sadece kendinize çocuk ekleyebilirsiniz"
        )
    
    return create_parent_child_relation(db=db, parent_id=relation.parent_id, child_id=relation.child_id)

@router.get("/ogretmen/{teacher_id}/ogrenciler", response_model=List[UserRead])
def read_teacher_students(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Öğretmenin öğrencilerini getir
    """
    # Sadece kendi öğrencileri veya yönetici
    if current_user.id != teacher_id and current_user.role not in [RoleEnum.teacher]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Başka bir öğretmenin öğrencilerini göremezsiniz"
        )
    
    return get_teacher_students(db=db, teacher_id=teacher_id)

@router.get("/veli/{parent_id}/cocuklar", response_model=List[UserRead])
def read_parent_children(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Ebeveynin çocuklarını getir
    """
    # Sadece kendi çocukları veya yönetici
    if current_user.id != parent_id and current_user.role not in [RoleEnum.teacher]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Başka bir ebeveynin çocuklarını göremezsiniz"
        )
    
    return get_parent_children(db=db, parent_id=parent_id)
