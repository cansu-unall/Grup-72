from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.word_difficulty import WordDifficultyRequest, WordDifficultyResponse
from ..services.word_difficulty import add_or_update_word_difficulty
from ..database import get_db
from ..models.models import User, RoleEnum
from ..routers.auth import get_current_active_user

router = APIRouter(
    prefix="/kelimeler",
    tags=["Kelimeler"],
)

@router.post("/zor", response_model=WordDifficultyResponse)
def zor_kelime_ekle(
    body: WordDifficultyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Sadece öğrenci erişebilir
    if current_user.role != RoleEnum.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece öğrenci erişebilir.")
    # JWT'deki id ile body'deki id aynı mı?
    if current_user.id != body.student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Kendi hesabınız için işlem yapabilirsiniz.")
    result = add_or_update_word_difficulty(db, body.student_id, body.kelime)
    return result
