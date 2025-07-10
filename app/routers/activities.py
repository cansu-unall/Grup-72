from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..services import (
    create_activity, get_activity, get_student_activities, update_activity, delete_activity,
    get_current_active_user, role_required
)
from ..schemas import (
    ActivityCreate, ActivityRead, ActivityUpdate
)
from ..models import User, RoleEnum
from ..database import get_db

router = APIRouter(
    prefix="/api/aktiviteler",
    tags=["aktiviteler"],
    responses={404: {"description": "Aktivite bulunamadı"}},
)

@router.post("/", response_model=ActivityRead, status_code=status.HTTP_201_CREATED)
def create_new_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.teacher]))
):
    """
    Yeni aktivite oluştur (Sadece öğretmenler)
    """
    return create_activity(db=db, activity=activity)

@router.get("/{activity_id}", response_model=ActivityRead)
def read_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Aktivite detaylarını getir
    """
    activity = get_activity(db, activity_id=activity_id)
    
    # Yetki kontrolü: Öğrenci sadece kendi aktivitelerini görebilir
    if current_user.role == RoleEnum.student and activity.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu aktiviteye erişim izniniz yok"
        )
    
    # Yetki kontrolü: Ebeveyn sadece çocuklarının aktivitelerini görebilir
    if current_user.role == RoleEnum.parent:
        children = [child.child_id for child in current_user.children]
        if activity.student_id not in children:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu aktiviteye erişim izniniz yok"
            )
    
    return activity

@router.get("/ogrenci/{student_id}", response_model=List[ActivityRead])
def read_student_activities(
    student_id: int,
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Öğrencinin aktivitelerini getir
    """
    # Yetki kontrolü
    if current_user.role == RoleEnum.student and student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Başka bir öğrencinin aktivitelerini göremezsiniz"
        )
    
    # Ebeveyn kontrolü
    if current_user.role == RoleEnum.parent:
        children = [child.child_id for child in current_user.children]
        if student_id not in children:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu öğrencinin aktivitelerine erişim izniniz yok"
            )
    
    activities = get_student_activities(db, student_id=student_id, skip=skip, limit=limit, completed=completed)
    return activities

@router.put("/{activity_id}", response_model=ActivityRead)
def update_existing_activity(
    activity_id: int,
    activity_update: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Aktiviteyi güncelle
    """
    # Önce aktiviteyi al
    activity = get_activity(db, activity_id=activity_id)
    
    # Öğrenci yetki kontrolü: Sadece tamamlandı durumunu değiştirebilir
    if current_user.role == RoleEnum.student:
        if activity.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu aktiviteyi güncelleme yetkiniz yok"
            )
        
        # Öğrenci sadece tamamlandı durumunu güncelleyebilir
        if activity_update.dict(exclude_unset=True).keys() != {"completed"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Öğrenciler sadece tamamlandı durumunu değiştirebilir"
            )
    
    # Ebeveyn yetki kontrolü: Aktiviteyi güncelleyemez
    if current_user.role == RoleEnum.parent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ebeveynler aktiviteleri güncelleyemez"
        )
    
    return update_activity(db=db, activity_id=activity_id, activity_update=activity_update)

@router.delete("/{activity_id}", status_code=status.HTTP_200_OK)
def delete_existing_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.teacher]))
):
    """
    Aktivite sil (Sadece öğretmenler)
    """
    return delete_activity(db=db, activity_id=activity_id)
