from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.ai_schemas import TextSimplifyRequest, TextSimplifyResponse
from ..schemas.ai_schemas import MetinUretRequest, MetinUretResponse
from ..schemas.ai_schemas import AnlamaSorusuResponse, AIYardimBotRequest, AIYardimBotResponse
from ..services.ai_service import simplify_text, generate_text, generate_comprehension_questions_with_gemini, yardim_bot_cevabi_uret

from ..models import User, RoleEnum
from ..services import get_current_active_user
from ..database import get_db

router = APIRouter(
    prefix="/api/ai",
    tags=["ai"],
)

@router.post("/metin-sadeleştir", response_model=TextSimplifyResponse)
def metin_sadeleştir(
    req: TextSimplifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Sadece öğretmenler erişebilir
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yalnızca öğretmenler yetkilidir.")
    result = simplify_text(req.raw_text, req.target_level)
    return TextSimplifyResponse(**result)


# Yeni endpoint: Kategoriye göre kısa ve sade metin üretir
@router.post("/metin-uret", response_model=MetinUretResponse)
def metin_uret(
    req: MetinUretRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Sadece öğretmenler erişebilir
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yalnızca öğretmenler yetkilidir.")
    result = generate_text(req.kategori)
    return MetinUretResponse(**result)

# Anlama sorusu üretme endpointi
@router.post("/anlama-sorusu-uret/{activity_id}", response_model=AnlamaSorusuResponse)
def anlama_sorusu_uret(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Sadece öğretmenler erişebilir
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yalnızca öğretmenler yetkilidir.")
    try:
        sorular = generate_comprehension_questions_with_gemini(db, activity_id)
        return {"sorular": sorular}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Yardım botu endpointi
@router.post("/yardim-bot", response_model=AIYardimBotResponse)
def yardim_bot(
    req: AIYardimBotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Sadece öğrenci kendi student_id'siyle erişebilir
    if current_user.role != RoleEnum.student or current_user.id != req.student_id:
        raise HTTPException(status_code=403, detail="Sadece kendi hesabınızla öğrenci olarak erişebilirsiniz.")
    yanit = yardim_bot_cevabi_uret(req.soru)
    return AIYardimBotResponse(yanit=yanit)
