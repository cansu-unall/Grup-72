from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
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
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=10)
    completed: Optional[bool] = None
    score: Optional[int] = Field(None, ge=0, le=100)
    feedback: Optional[str] = None

# Activity read schema
class ActivityRead(ActivityBase):
    id: int
    student_id: int
    completed: bool
    score: Optional[int] = None
    feedback: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
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

class StudentProgressReport(BaseModel):
    total_completed: int
    average_score: Optional[float] = None
    max_score: Optional[int] = None
    min_score: Optional[int] = None
    progress_over_time: List[ProgressItem]

# Aktiviteyi tamamlamak için öğrenciye özel request modeli
class AktiviteTamamlaRequest(BaseModel):
    feedback: Optional[str] = None

# Student teacher relationship schema
class StudentTeacherCreate(BaseModel):
    student_id: int
    teacher_id: int

# Parent child relationship schema
class ParentChildCreate(BaseModel):
    parent_id: int
    child_id: int
