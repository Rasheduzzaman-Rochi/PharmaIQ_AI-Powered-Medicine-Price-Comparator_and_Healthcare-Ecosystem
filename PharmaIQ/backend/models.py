from pydantic import BaseModel
from typing import List, Optional

class SearchQuery(BaseModel):
    medicine_name: str
    reason: Optional[str] = ""

class InteractionRequest(BaseModel):
    medicines: List[str]

class SymptomRequest(BaseModel):
    symptoms: str
    age: Optional[int] = None
    gender: Optional[str] = None
    duration: Optional[str] = None

class DosageRequest(BaseModel):
    medicine_name: str
    age: int
    weight: float
    gender: Optional[str] = None
    condition: Optional[str] = None

class SideEffectRequest(BaseModel):
    medicine_name: str
    patient_age: Optional[int] = None
    existing_conditions: List[str] = []

class MedicineInfoRequest(BaseModel):
    medicine_name: str

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []


class OrderItem(BaseModel):
    id: str
    name: str
    brand: Optional[str] = ""
    qty: int
    price: float


class OrderRequest(BaseModel):
    customer_name: str
    mobile: str
    address: str
    total: float
    items: List[OrderItem]