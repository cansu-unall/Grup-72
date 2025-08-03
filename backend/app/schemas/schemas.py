from pydantic import BaseModel, EmailStr, Field, validator, field_validator
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

# Role enum
class Role(str, Enum):
    student = "student"
    teacher = "teacher"
    parent = "parent"
    admin = "admin"

# Base user schema
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: Role

# Create user schema
class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Şifre en az 8 karakter olmalıdır')
        return v

# User update schema
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    # Not: role güncellenmez, güvenlik nedeniyle ayrı endpoint gerekir
    # password güncellenmez, ayrı endpoint gerekir

# User login schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str

# Token data schema
class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[Role] = None

# User profile base schema
class UserProfileBase(BaseModel):
    additional_info: Optional[str] = None

# Student profile schema
class StudentProfileBase(UserProfileBase):
    age: Optional[int] = None
    dyslexia_level: Optional[str] = None


class StudentProfileCreate(StudentProfileBase):
    pass

# Öğrenci profili güncelleme şeması
class StudentProfileUpdate(UserProfileBase):
    age: Optional[int] = None
    dyslexia_level: Optional[str] = None

class StudentProfileRead(StudentProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# Teacher profile schema
class TeacherProfileBase(UserProfileBase):
    specialization: Optional[str] = None  # Genel uzmanlık alanı (matematik, dil, fen vb.)
    dyslexia_approach: Optional[str] = None  # Disleksi öğretim yaklaşımı
    experience_years: Optional[int] = None  # Deneyim yılı
    qualifications: Optional[str] = None  # Eğitim ve sertifikalar

class TeacherProfileCreate(TeacherProfileBase):
    pass

class TeacherProfileRead(TeacherProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# Parent profile schema
class ParentProfileBase(UserProfileBase):
    relationship_type: Optional[str] = None  # Anne, Baba, Vasi vb.

class ParentProfileCreate(ParentProfileBase):
    pass

class ParentProfileRead(ParentProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# Deprecated: Eski kod ile uyumluluk için (kaldırılacak)
class UserProfileCreate(UserProfileBase):
    age: Optional[int] = None
    dyslexia_level: Optional[str] = None

# Deprecated: Eski kod ile uyumluluk için (kaldırılacak)
class UserProfileUpdate(UserProfileBase):
    age: Optional[int] = None
    dyslexia_level: Optional[str] = None

# Deprecated: Eski kod ile uyumluluk için (kaldırılacak)
class UserProfileRead(UserProfileBase):
    id: int
    user_id: int
    age: Optional[int] = None
    dyslexia_level: Optional[str] = None
    
    class Config:
        from_attributes = True

# User read schema
class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    student_profile: Optional[StudentProfileRead] = None
    teacher_profile: Optional[TeacherProfileRead] = None
    parent_profile: Optional[ParentProfileRead] = None
    
    class Config:
        from_attributes = True

# User read schema with relations
class UserReadWithRelations(UserRead):
    # İlişkili kullanıcılar burada yer alacak
    related_students: Optional[List["UserRead"]] = None  # Öğretmen için: öğrenciler
    related_children: Optional[List["UserRead"]] = None  # Veli için: çocuklar  
    related_teachers: Optional[List["UserRead"]] = None  # Öğrenci için: öğretmenler
    related_parents: Optional[List["UserRead"]] = None   # Öğrenci için: veliler
    
    class Config:
        from_attributes = True

# Pydantic'in recursive modelleri çözebilmesi için gereken forward reference
UserReadWithRelations.update_forward_refs()

# Activity base schema
class ActivityBase(BaseModel):
    activity_type: str
    title: str
    description: Optional[str] = None
    content: str
    difficulty_level: int = Field(ge=1, le=10)

# Activity create schema
class ActivityCreate(ActivityBase):
    student_id: int

# Activity update schema
class ActivityUpdate(BaseModel):
    activity_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=10)
    completed: Optional[bool] = None
    score: Optional[int] = Field(None, ge=0, le=100)
    feedback: Optional[str] = None
    questions: Optional[str] = None  # JSON string
    correct_answers: Optional[str] = None  # JSON string

    @field_validator("questions", mode="before")
    @classmethod
    def parse_questions_for_update(cls, v):
        import json
        if v is None:
            return None
        if isinstance(v, str):
            return v  # Already a JSON string
        elif isinstance(v, list):
            # If it's a list of objects, extract question_text and convert to JSON
            if len(v) > 0 and isinstance(v[0], dict) and 'question_text' in v[0]:
                questions_only = [item.get('question_text', '') for item in v]
                return json.dumps(questions_only, ensure_ascii=False)
            else:
                # If it's already a list of strings
                return json.dumps(v, ensure_ascii=False)
        return json.dumps(v, ensure_ascii=False)

    @field_validator("correct_answers", mode="before")  
    @classmethod
    def parse_correct_answers_for_update(cls, v):
        import json
        if v is None:
            return None
        if isinstance(v, str):
            return v  # Already a JSON string
        elif isinstance(v, list):
            # If it's a list of objects, extract correct_answer and convert to JSON
            if len(v) > 0 and isinstance(v[0], dict) and 'correct_answer' in v[0]:
                answers_only = [item.get('correct_answer', '') for item in v]
                return json.dumps(answers_only, ensure_ascii=False)
            else:
                # If it's already a list of strings
                return json.dumps(v, ensure_ascii=False)
        return json.dumps(v, ensure_ascii=False)

# Activity read schema
class ActivityRead(ActivityBase):
    id: int
    student_id: int
    completed: bool
    score: Optional[int] = None
    feedback: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    questions: Optional[List[Dict]] = None  # Changed to Dict to support objects
    student_answers: Optional[List[str]] = None
    correct_answers: Optional[List[str]] = None

    @field_validator("questions", mode="before")
    @classmethod
    def parse_questions(cls, v):
        import json
        if v is None:
            return None
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                # Convert to list of dicts with question_text and correct_answer
                if isinstance(parsed, list) and len(parsed) > 0:
                    if isinstance(parsed[0], str):
                        # If it's just strings, convert to question objects
                        return [{"question_text": q, "correct_answer": ""} for q in parsed]
                    elif isinstance(parsed[0], dict):
                        # If it's already objects, return as is
                        return parsed
                return parsed
            except Exception:
                return None
        elif isinstance(v, list):
            # If it's already a list of objects, return as is
            if len(v) > 0 and isinstance(v[0], dict):
                return v
            # If it's strings, convert to objects
            elif len(v) > 0 and isinstance(v[0], str):
                return [{"question_text": q, "correct_answer": ""} for q in v]
            return v
        return v

    @field_validator("student_answers", mode="before")
    @classmethod
    def parse_student_answers(cls, v):
        import json
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return None
        return v

    @field_validator("correct_answers", mode="before")
    @classmethod
    def parse_correct_answers(cls, v):
        import json
        if v is None:
            return None
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                # If it's a list of objects with correct_answer, extract just the answer
                if isinstance(parsed, list) and len(parsed) > 0 and isinstance(parsed[0], dict):
                    if 'correct_answer' in parsed[0]:
                        return [item.get('correct_answer', '') for item in parsed]
                # If it's already a list of strings, return as is
                if isinstance(parsed, list):
                    return parsed
                return parsed
            except Exception:
                return None
        elif isinstance(v, list):
            # If it's already a list of objects, extract the correct_answer
            if len(v) > 0 and isinstance(v[0], dict) and 'correct_answer' in v[0]:
                return [item.get('correct_answer', '') for item in v]
            # If it's already a list of strings, return as is
            return v
        return v

    class Config:
        from_attributes = True

# Öğrenci ilerleme raporu response modeli
from pydantic import BaseModel
from typing import List, Optional

class ProgressItem(BaseModel):
    id: int
    created_at: datetime
    score: Optional[int] = None
    difficulty_level: int


# Öğretmen sınıf durumu raporu için response modeli

from .kelime_schemas import ZorKelimeResponse

class SinifDurumuItem(BaseModel):
    id: int
    ad: str
    toplam_tamamlanan: int
    ortalama_skor: Optional[float] = None
    son_aktivite_tarihi: Optional[datetime] = None
    zorlandigi_kelimeler: list[ZorKelimeResponse] = []
    zorlandigi_aktiviteler: List[ActivityRead] = []  # Skoru 50'nin altında olan aktiviteler


class CocukGelisimItem(BaseModel):
    id: int
    ad: str
    toplam_aktivite: int
    ortalama_skor: Optional[float] = None
    son_tamamlanan_tarih: Optional[datetime] = None
    zorlandigi_aktiviteler: List[ActivityRead] = []
    zorlandigi_kelimeler: list[ZorKelimeResponse] = []

class CocukGelisimRaporu(BaseModel):
    cocuklar: List[CocukGelisimItem]

class OgrenciDurumItem(BaseModel):
    toplam_aktivite: int  # Öğrencinin toplam aktivite sayısı
    tamamlanan_aktivite: int  # Öğrencinin tamamladığı aktivite sayısı
    basari_orani: float  # Başarı oranı (tamamlanan/toplam)
    ortalama_skor: Optional[float]  # Ortalama skor
    en_yuksek_skor: Optional[int]  # En yüksek skor
    en_dusuk_skor: Optional[int]  # En düşük skor
    zorlandigi_aktiviteler: List[ActivityRead] = []  # Skoru 50'nin altında olan aktiviteler (tüm detaylarıyla)
    zorlandigi_kelimeler: list[ZorKelimeResponse] = []  # Zorlandığı kelimeler

class StudentProgressReport(BaseModel):
    total_completed: int
    average_score: Optional[float] = None
    max_score: Optional[int] = None
    min_score: Optional[int] = None
    progress_over_time: List[ProgressItem]

# Student teacher relationship schema
class StudentTeacherCreate(BaseModel):
    student_id: int
    teacher_id: int

# Parent child relationship schema
class ParentChildCreate(BaseModel):
    parent_id: int
    child_id: int
