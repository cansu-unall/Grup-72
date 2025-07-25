from pydantic import BaseModel

class TextSimplifyRequest(BaseModel):
    raw_text: str
    target_level: int

class TextSimplifyResponse(BaseModel):
    simplified_text: str
    level: int
