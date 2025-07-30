
from pydantic import BaseModel

class TextSimplifyRequest(BaseModel):
    raw_text: str
    target_level: int


# Anlama sorusu ve cevabı için yanıt modeli
class AnlamaSoru(BaseModel):
    soru: str
    dogru_cevap: str

class AnlamaSorusuResponse(BaseModel):
    sorular: list[AnlamaSoru]

class TextSimplifyResponse(BaseModel):
    simplified_text: str
    level: int


# Metin üretme endpointi için istek ve yanıt modelleri
class MetinUretRequest(BaseModel):
    kategori: str


# Quiz cevaplama için istek modeli
class StudentQuizAnswerRequest(BaseModel):
    student_id: int
    cevaplar: list[str]

class MetinUretResponse(BaseModel):
    uretilen_metin: str
    kategori: str

# Yardım botu için istek ve yanıt modelleri
class AIYardimBotRequest(BaseModel):
    student_id: int
    soru: str

class AIYardimBotResponse(BaseModel):
    yanit: str