from pydantic import BaseModel

class WordDifficultyRequest(BaseModel):
    student_id: int
    kelime: str

class WordDifficultyResponse(BaseModel):
    student_id: int
    kelime: str
    tekrar_sayisi: int
