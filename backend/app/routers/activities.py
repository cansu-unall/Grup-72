from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..services import (
    create_activity, get_activity, get_student_activities, update_activity, delete_activity,
    get_teacher_activities,
    search_teacher_activities,
    get_current_active_user, role_required
)

from ..services.activity import get_student_progress_report
from ..schemas import StudentProgressReport

from ..schemas import (
    ActivityCreate, ActivityRead, ActivityUpdate
)
from ..models import User, RoleEnum
from ..database import get_db
from ..schemas import AktiviteTamamlaRequest
from ..services.activity import complete_activity_by_student

from ..schemas import SinifDurumuItem
from ..services.activity import get_teacher_class_report

from ..schemas import CocukGelisimItem
from ..services.activity import get_parent_children_report

from ..schemas import OgrenciDurumItem
from ..services.activity import get_student_status_report

router = APIRouter(
    prefix="/api/aktiviteler",
    tags=["aktiviteler"],
    responses={404: {"description": "Aktivite bulunamadı"}},
)

# Aktivite arama endpoint'i (Sadece öğretmenler)
@router.get("/arama", response_model=List[ActivityRead])
def search_activities(
    title: Optional[str] = Query(None),
    description: Optional[str] = Query(None),
    difficulty_level: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.teacher]))
):
    """
    Öğretmen kendi ilişkili olduğu öğrenciler için aktivitelerde arama yapar.
    Sadece öğretmenler erişebilir.
    """
    return search_teacher_activities(
        db=db,
        teacher_id=current_user.id,
        title=title,
        description=description,
        difficulty_level=difficulty_level
    )

@router.get("/ogretmen/{teacher_id}", response_model=List[ActivityRead])
def read_teacher_activities(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Belirli bir öğretmenin kendi ilişkili olduğu öğrenciler için oluşturduğu aktiviteleri listeler.
    Sadece öğretmen kendi aktivitelerini görebilir.
    """
    # JWT doğrulama: Sadece kendi aktivitelerini görebilsin
    if current_user.role != RoleEnum.teacher or current_user.id != teacher_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece kendi aktivitelerinizi görebilirsiniz.")
    activities = get_teacher_activities(db, teacher_id)
    return activities

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

# Öğrenci ilerleme raporu endpoint'i
@router.get("/raporlar/ogrenci/{student_id}/ilerleme", response_model=StudentProgressReport)
def get_student_progress(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Öğrenci ilerleme raporu getirir.
    """
    # Yetki kontrolü
    if current_user.role == RoleEnum.student and current_user.id != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece kendi ilerlemenizi görebilirsiniz.")
    if current_user.role == RoleEnum.teacher:
        # Öğretmenin ilişkili olduğu öğrenciler
        student_ids = [st.student_id for st in current_user.students]
        if student_id not in student_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece ilişkili olduğunuz öğrencilerin raporunu görebilirsiniz.")
    if current_user.role == RoleEnum.parent:
        children_ids = [child.child_id for child in current_user.children]
        if student_id not in children_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece ilişkili olduğunuz çocukların raporunu görebilirsiniz.")

    rapor = get_student_progress_report(db, student_id)
    if rapor is None:
        raise HTTPException(status_code=404, detail="Aktivite bulunamadı")

    # Listeyi Pydantic objesine dönüştür
    rapor["progress_over_time"] = [
        StudentProgressReport.model_fields["progress_over_time"].annotation.__args__[0](**item)
        for item in rapor["progress_over_time"]
    ]
    return StudentProgressReport(**rapor)

# Öğrencinin kendi aktivitesini tamamlaması için endpoint
@router.post("/ogrenci/{activity_id}/tamamla", response_model=ActivityRead)
def ogrenci_aktivite_tamamla(
    activity_id: int,
    tamamla_data: AktiviteTamamlaRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.student]))
):
    """
    Öğrenci kendi aktivitesini tamamlar. Skor sistem tarafından otomatik hesaplanır.
    Sadece öğrenci kendi aktivitesi için erişebilir.
    """
    return complete_activity_by_student(db, activity_id, current_user.id, tamamla_data)

# --- SINIF DURUMU RAPORU ENDPOINTİ ---


@router.get("/raporlar/ogretmen/{teacher_id}/sinif-durumu", response_model=List[SinifDurumuItem])
def get_teacher_class_status(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Öğretmenin sınıfındaki öğrencilerin genel durumunu özetleyen rapor.
    Sadece öğretmenler ve kendi öğrencileri için erişim izni vardır.
    """
    # Yetki kontrolü: Sadece öğretmen ve kendi ID'si
    if current_user.role != RoleEnum.teacher or current_user.id != teacher_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece kendi sınıfınızın raporunu görebilirsiniz.")
    return get_teacher_class_report(db, teacher_id)

# --- VELİ ÇOCUK GELİŞİMİ RAPORU ENDPOINTİ ---

@router.get("/raporlar/veli/{parent_id}/cocuk-gelisimi", response_model=List[CocukGelisimItem])
def get_parent_children_status(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Veliye bağlı çocukların gelişim raporu.
    Sadece veliler ve kendi çocukları için erişim izni vardır.
    """
    # Yetki kontrolü: Sadece veli ve kendi ID'si
    if current_user.role != RoleEnum.parent or current_user.id != parent_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece kendi çocuklarınızın raporunu görebilirsiniz.")
    return get_parent_children_report(db, parent_id)


@router.get("/raporlar/ogrenci/{student_id}/durumum", response_model=OgrenciDurumItem)
def get_student_status(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Öğrenci kendi genel durumunu özetleyen rapor.
    Sadece öğrenci ve kendi ID'si ile erişim izni vardır.
    """
    if current_user.role != RoleEnum.student or current_user.id != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece kendi durumunuzu görebilirsiniz.")
    return get_student_status_report(db, student_id)