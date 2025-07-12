from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# .env dosyasını yükle
load_dotenv()

# Veritabanı bağlantı URL'si
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy engine oluştur
engine = create_engine(DATABASE_URL)

# SessionLocal sınıfı oluştur, veritabanı oturumları için
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Taban model sınıfı oluştur
Base = declarative_base()

# Veritabanı oturumu oluşturmak için dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
