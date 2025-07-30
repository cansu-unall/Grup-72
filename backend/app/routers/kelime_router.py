from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.kelime_schemas import ZorKelimeResponse
from ..services.kelime_service import get_student_zor_kelimeler
from ..database import get_db
from ..models.models import User, RoleEnum
from ..routers.auth import get_current_active_user

router = APIRouter(
    prefix="/kelimeler",
    tags=["Kelimeler"],
)

@router.get("/tekrar", response_model=list[ZorKelimeResponse])
def get_zor_kelimeler(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != RoleEnum.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece öğrenciler kendi zor kelimelerini görebilir.")
    kelimeler = get_student_zor_kelimeler(db, current_user.id)
    return [ZorKelimeResponse(kelime=k.kelime, tekrar_sayisi=k.tekrar_sayisi) for k in kelimeler]
