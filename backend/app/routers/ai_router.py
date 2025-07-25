from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.ai_schemas import TextSimplifyRequest, TextSimplifyResponse
from ..services.ai_service import simplify_text
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
