from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Text, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base

# User role enum
class RoleEnum(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    parent = "parent"
    admin = "admin"

# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False)
    parent_profile = relationship("ParentProfile", back_populates="user", uselist=False)
    student_activities = relationship("Activity", back_populates="student")
    
    # Teacher öğrenci ilişkisi
    students = relationship("StudentTeacher", back_populates="teacher", foreign_keys="StudentTeacher.teacher_id")
    teachers = relationship("StudentTeacher", back_populates="student", foreign_keys="StudentTeacher.student_id")
    
    # Parent çocuk ilişkisi
    children = relationship("ParentChild", back_populates="parent", foreign_keys="ParentChild.parent_id")
    parents = relationship("ParentChild", back_populates="child", foreign_keys="ParentChild.child_id")

# User profil modeli (KALDIRILDI)
# Bu model artık kullanılmıyor ve veritabanından kaldırıldı
# Yerine rol bazlı profil modelleri kullanılıyor

# Öğrenci profil modeli
class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    age = Column(Integer, nullable=True)
    dyslexia_level = Column(String, nullable=True)
    additional_info = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="student_profile")

# Öğretmen profil modeli
class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialization = Column(String, nullable=True)  # Genel uzmanlık alanı
    dyslexia_approach = Column(String, nullable=True)  # Disleksi öğretim yaklaşımı
    experience_years = Column(Integer, nullable=True)  # Deneyim yılı
    qualifications = Column(String, nullable=True)  # Eğitim ve sertifikalar
    additional_info = Column(Text, nullable=True)  # Ek bilgiler
    
    user = relationship("User", back_populates="teacher_profile")

# Veli profil modeli
class ParentProfile(Base):
    __tablename__ = "parent_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    relationship_type = Column(String, nullable=True)
    additional_info = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="parent_profile")

# Öğrenci-Öğretmen ilişki tablosu
class StudentTeacher(Base):
    __tablename__ = "student_teacher"
    
    student_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    
    student = relationship("User", back_populates="teachers", foreign_keys=[student_id])
    teacher = relationship("User", back_populates="students", foreign_keys=[teacher_id])

# Ebeveyn-Çocuk ilişki tablosu
class ParentChild(Base):
    __tablename__ = "parent_child"
    
    parent_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    child_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    
    parent = relationship("User", back_populates="children", foreign_keys=[parent_id])
    child = relationship("User", back_populates="parents", foreign_keys=[child_id])

# Token blacklist modeli
class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, nullable=False, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blacklisted_at = Column(DateTime, default=datetime.now)
    expires_at = Column(DateTime, nullable=False)
    
    user = relationship("User")

# Aktivite modeli
class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String, nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    difficulty_level = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
    
    student = relationship("User", back_populates="student_activities")
