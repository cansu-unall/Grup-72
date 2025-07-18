from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..services import (
    create_user, get_user, get_users, update_user,  
    create_student_teacher_relation, create_parent_child_relation,
    get_teacher_students, get_parent_children,
    get_current_active_user, role_required,
    create_student_profile, create_teacher_profile, create_parent_profile
)
from ..schemas import (
    UserCreate, UserRead, UserReadWithRelations, UserUpdate,
    StudentTeacherCreate, ParentChildCreate, Role,
    StudentProfileCreate, StudentProfileRead,
    TeacherProfileCreate, TeacherProfileRead,
    ParentProfileCreate, ParentProfileRead
)
from ..models import User, RoleEnum, StudentTeacher, ParentChild
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

@router.put("/{user_id}", response_model=UserRead)
def update_user_endpoint(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Kullanıcı bilgilerini güncelle
    - Kullanıcılar sadece kendi bilgilerini güncelleyebilir
    - Admin tüm kullanıcıları güncelleyebilir
    - Rol ve şifre bu endpoint ile güncellenemez (güvenlik nedeniyle)
    """
    # Yetki kontrolü: Sadece kendi profili veya admin
    if current_user.id != user_id and current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sadece kendi profilinizi güncelleyebilirsiniz"
        )
    
    return update_user(db=db, user_id=user_id, user_update=user_update)

@router.post("/iliskiler/ogrenci-ogretmen", status_code=status.HTTP_201_CREATED)
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

@router.post("/iliskiler/veli-cocuk", status_code=status.HTTP_201_CREATED)
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

@router.get("/", response_model=List[UserRead])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    role: Optional[Role] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.admin]))
):
    """
    Kullanıcıları listele (Sadece admin)
    """
    users = get_users(db, skip=skip, limit=limit, role=role)
    return users

@router.delete("/eski-profil-silme", status_code=status.HTTP_200_OK)
def delete_legacy_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.teacher]))  # Sadece öğretmenler çalıştırabilir
):
    """
    Eski profil verilerini siler (Migrasyon sonrası temizlik için)
    """
    from ..models import UserProfile
    
    # Tüm eski profilleri bul ve sil
    old_profiles = db.query(UserProfile).all()
    deleted_count = len(old_profiles)
    
    for profile in old_profiles:
        db.delete(profile)
    
    db.commit()
    return {"message": f"{deleted_count} eski profil başarıyla silindi"}

@router.post("/{user_id}/ogrenci-profili", response_model=StudentProfileRead)
def create_student_profile_for_user(
    user_id: int,
    profile: StudentProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Öğrenci profili oluştur (Sadece öğrenciler için)
    """
    # Profil oluşturulacak kullanıcıyı kontrol et
    db_user = get_user(db, user_id=user_id)
    
    # Sadece öğrenciler için profil oluşturulabilir
    if db_user.role != RoleEnum.student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sadece öğrenci rollü kullanıcılar için profil oluşturulabilir"
        )
    
    # Yetki kontrolü: Sadece kendi profili veya yetkili kullanıcı (öğretmen/ebeveyn)
    if current_user.id != user_id and current_user.role not in [RoleEnum.teacher, RoleEnum.parent]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Başka bir öğrenci için profil oluşturamazsınız"
        )
    
    return create_student_profile(db=db, profile=profile, user_id=user_id)

@router.post("/{user_id}/ogretmen-profili", response_model=TeacherProfileRead)
def create_teacher_profile_for_user(
    user_id: int,
    profile: TeacherProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Öğretmen profili oluştur (Sadece öğretmenler için)
    """
    # Profil oluşturulacak kullanıcıyı kontrol et
    db_user = get_user(db, user_id=user_id)
    
    # Sadece öğretmenler için profil oluşturulabilir
    if db_user.role != RoleEnum.teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sadece öğretmen rollü kullanıcılar için profil oluşturulabilir"
        )
    
    # Yetki kontrolü: Sadece kendi profili
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sadece kendi profilinizi oluşturabilirsiniz"
        )
    
    return create_teacher_profile(db=db, profile=profile, user_id=user_id)

@router.post("/{user_id}/veli-profili", response_model=ParentProfileRead)
def create_parent_profile_for_user(
    user_id: int,
    profile: ParentProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Veli profili oluştur (Sadece veliler için)
    """
    # Profil oluşturulacak kullanıcıyı kontrol et
    db_user = get_user(db, user_id=user_id)
    
    # Sadece veliler için profil oluşturulabilir
    if db_user.role != RoleEnum.parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sadece veli rollü kullanıcılar için profil oluşturulabilir"
        )
    
    # Yetki kontrolü: Sadece kendi profili
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sadece kendi profilinizi oluşturabilirsiniz"
        )
    
    return create_parent_profile(db=db, profile=profile, user_id=user_id)

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
    # Sadece kendi çocukları
    if current_user.id == parent_id:
        return get_parent_children(db=db, parent_id=parent_id)
    
    # Admin tüm ilişkileri görebilir
    if current_user.role == RoleEnum.admin:
        return get_parent_children(db=db, parent_id=parent_id)
    
    # Öğretmen sadece kendi öğrencilerinin velilerini görebilir
    if current_user.role == RoleEnum.teacher:
        # Bu velinin çocuklarını al
        children = get_parent_children(db=db, parent_id=parent_id)
        # Öğretmenin öğrencilerini al
        teacher_students = get_teacher_students(db, teacher_id=current_user.id)
        teacher_student_ids = [student.id for student in teacher_students]
        
        # Bu velinin çocuklarından herhangi biri öğretmenin öğrencisi mi?
        accessible_children = [child for child in children if child.id in teacher_student_ids]
        
        if not accessible_children:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu velinin çocukları sizin öğrenciniz değil"
            )
        
        return accessible_children
    
    # Diğer durumlar için erişim yok
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Bu bilgilere erişim yetkiniz yok"
    )

@router.get("/{user_id}", response_model=UserReadWithRelations)
def read_user(
    user_id: int, 
    include_relations: bool = True,  # İlişkileri dahil etmek için yeni parametre
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Kullanıcı bilgilerini getir (Sadece kendisi, ilişkili öğretmen/veli veya admin)
    İlişkili kullanıcılar (öğretmenlerin öğrencileri, velilerin çocukları) da dahil edilebilir.
    """
    # Kendi profilini görüntülüyor mu?
    if current_user.id == user_id:
        db_user = get_user(db, user_id=user_id)
    # Admin mi kontrol et
    elif current_user.role == RoleEnum.admin:
        db_user = get_user(db, user_id=user_id)
    # Öğretmen, öğrencilerini görüntüleyebilir
    elif current_user.role == RoleEnum.teacher:
        students = get_teacher_students(db, teacher_id=current_user.id)
        student_ids = [student.id for student in students]
        if user_id in student_ids:
            db_user = get_user(db, user_id=user_id)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu kullanıcının bilgilerine erişim yetkiniz yok"
            )
    # Veli, çocuklarını görüntüleyebilir
    elif current_user.role == RoleEnum.parent:
        children = get_parent_children(db, parent_id=current_user.id)
        child_ids = [child.id for child in children]
        if user_id in child_ids:
            db_user = get_user(db, user_id=user_id)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu kullanıcının bilgilerine erişim yetkiniz yok"
            )
    else:
        # Yetkisiz erişim
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu kullanıcının bilgilerine erişim yetkiniz yok"
        )
    
    # İlişkileri yükle
    if include_relations:
        result = {
            **db_user.__dict__,
            "related_students": [],
            "related_children": [],
            "related_teachers": [],
            "related_parents": []
        }
        
        if db_user.role == RoleEnum.teacher:
            # Öğretmenin öğrencileri
            result["related_students"] = get_teacher_students(db, teacher_id=db_user.id)
        elif db_user.role == RoleEnum.parent:
            # Velinin çocukları
            result["related_children"] = get_parent_children(db, parent_id=db_user.id)
        elif db_user.role == RoleEnum.student:
            # Öğrencinin öğretmenleri
            # Öğretmen-öğrenci ilişkisini bul
            student_teachers = db.query(StudentTeacher).filter_by(student_id=db_user.id).all()
            teacher_ids = [relation.teacher_id for relation in student_teachers]
            teachers = db.query(User).filter(User.id.in_(teacher_ids)).all()
            result["related_teachers"] = teachers
            
            # Öğrencinin velileri
            # Veli-çocuk ilişkisini bul
            parent_children = db.query(ParentChild).filter_by(child_id=db_user.id).all()
            parent_ids = [relation.parent_id for relation in parent_children]
            parents = db.query(User).filter(User.id.in_(parent_ids)).all()
            result["related_parents"] = parents
        
        return result
    
    return db_user

@router.post("/profil-migrasyonu", status_code=status.HTTP_200_OK, deprecated=True)
def migrate_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.teacher]))  # Sadece öğretmenler çalıştırabilir
):
    """
    Eski profil verileri zaten taşındı ve eski profil tablosu kaldırıldı.
    Bu endpoint artık kullanım dışıdır.
    """
    return {"message": "Profil migrasyonu tamamlandı. Eski profil tablosu kaldırıldı."}
