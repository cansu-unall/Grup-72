from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from jose import jwt

from ..services.auth import (
    authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, 
    get_current_active_user, blacklist_token, SECRET_KEY, ALGORITHM
)
from ..schemas import Token, UserLogin
from ..database import get_db

# OAuth2 scheme tanımı
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/giris/erisim-token")

router = APIRouter(
    prefix="/api/giris",
    tags=["giris"],
    responses={401: {"description": "Yetkilendirme hatası"}},
)

@router.post("/erisim-token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    JWT token almak için giriş yap
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/oturum-ac", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Email ve şifre ile giriş yap
    """
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/cikis-yap", status_code=status.HTTP_200_OK)
async def logout(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Oturum kapatma - token'ı blacklist'e ekler
    """
    try:
        # Token'ı decode ederek geçerlilik tarihini alıyoruz
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_timestamp = payload.get("exp")
        
        if exp_timestamp:
            expires_at = datetime.utcfromtimestamp(exp_timestamp)
        else:
            # Eğer exp yoksa varsayılan bir süre sonrası
            expires_at = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Token'ı blacklist'e ekle
        blacklist_token(db, token, current_user.id, expires_at)
        
        return {"message": "Oturum başarıyla kapatıldı"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Oturum kapatma sırasında hata oluştu"
        )
