from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .routers import giris_router, kullanicilar_router, aktiviteler_router
from .models import models
from .database import engine

# .env dosyasını yükle
load_dotenv()

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)

# FastAPI uygulamasını oluştur
app = FastAPI(
    title="Disleksi Destek API",
    description="Disleksi yaşayan öğrenciler için AI destekli kişisel gelişim uygulaması",
    version="1.0.0"
)

# CORS ayarları
origins = [
    "http://localhost",
    "http://localhost:3000",  # React frontend için
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routerları ekle
from .routers.ai_router import router as ai_router
app.include_router(giris_router)
app.include_router(kullanicilar_router)
app.include_router(aktiviteler_router)
app.include_router(ai_router)

@app.get("/")
def read_root():
    return {"message": "DyslexiAI API'ye Hoş Geldiniz"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
