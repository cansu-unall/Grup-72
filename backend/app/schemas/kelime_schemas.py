from pydantic import BaseModel, RootModel
from typing import List

class ZorKelimeCreate(BaseModel):
    kelime: str

class ZorKelimeResponse(BaseModel):
    kelime: str
    tekrar_sayisi: int

class ZorKelimeListResponse(RootModel[List[ZorKelimeResponse]]):
    pass
