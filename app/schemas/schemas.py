from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Role enum
class Role(str, Enum):
    student = "student"
    teacher = "teacher"
    parent = "parent"

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
    age: Optional[int] = None
    dyslexia_level: Optional[str] = None
    additional_info: Optional[str] = None

# User profile create schema
class UserProfileCreate(UserProfileBase):
    pass

# User profile update schema
class UserProfileUpdate(UserProfileBase):
    pass

# User profile schema with user relationship
class UserProfileRead(UserProfileBase):
    id: int
    user_id: int
    
    class Config:
        orm_mode = True

# User read schema
class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileRead] = None
    
    class Config:
        orm_mode = True

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
        orm_mode = True

# Student teacher relationship schema
class StudentTeacherCreate(BaseModel):
    student_id: int
    teacher_id: int

# Parent child relationship schema
class ParentChildCreate(BaseModel):
    parent_id: int
    child_id: int
