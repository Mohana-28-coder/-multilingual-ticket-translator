from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    CLIENT = "client"
    ADMIN = "admin"

class TicketStatus(str, Enum):
    PENDING = "pending"
    DELIVERED = "delivered"
    REVIEWED = "reviewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    RESOLVED = "resolved"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    preferred_language: Optional[str] = "en"

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CLIENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Ticket Schemas
class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[str] = None

class AttachmentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: Optional[str]
    file_size: Optional[int]
    extracted_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TicketResponseCreate(BaseModel):
    original_response: str
    use_ai_suggestion: bool = False
    ai_suggestion: Optional[str] = None

class TicketResponseOut(BaseModel):
    id: int
    original_response: str
    translated_response: Optional[str]
    target_language: Optional[str]
    ai_suggested: bool
    ai_suggestion: Optional[str]
    created_at: datetime
    responder_id: int

    class Config:
        from_attributes = True

class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    subject: str
    description: str
    original_language: Optional[str]
    detected_language: Optional[str]
    translated_subject: Optional[str]
    translated_description: Optional[str]
    status: TicketStatus
    priority: str
    client_id: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    attachments: List[AttachmentResponse] = []
    responses: List[TicketResponseOut] = []

    class Config:
        from_attributes = True

class TicketListResponse(BaseModel):
    id: int
    ticket_number: str
    subject: str
    status: TicketStatus
    priority: str
    detected_language: Optional[str]
    created_at: datetime
    client_id: int

    class Config:
        from_attributes = True

# AI/Translation Schemas
class TranslationRequest(BaseModel):
    text: str
    source_language: Optional[str] = None
    target_language: str = "en"

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence: Optional[float] = None

class LanguageDetectionResponse(BaseModel):
    text: str
    detected_language: str
    language_name: str
    confidence: float

class AISuggestionRequest(BaseModel):
    ticket_subject: str
    ticket_description: str
    target_language: str = "en"

class AISuggestionResponse(BaseModel):
    suggestion: str
    translated_suggestion: Optional[str] = None
    target_language: str

# KPI Schemas
class KPIResponse(BaseModel):
    total_tickets: int
    tickets_today: int
    pending_tickets: int
    resolved_tickets: int
    awaiting_translation: int
    average_resolution_time: Optional[float]