from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    CLIENT = "client"
    ADMIN = "admin"

class TicketStatus(str, enum.Enum):
    PENDING = "pending"
    DELIVERED = "delivered"
    REVIEWED = "reviewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    RESOLVED = "resolved"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.CLIENT)
    preferred_language = Column(String(10), default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tickets = relationship("Ticket", back_populates="client", foreign_keys="Ticket.client_id")
    responses = relationship("TicketResponse", back_populates="responder")

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True, index=True)
    subject = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    original_language = Column(String(10))
    detected_language = Column(String(50))
    translated_subject = Column(String(500))
    translated_description = Column(Text)
    status = Column(Enum(TicketStatus), default=TicketStatus.PENDING)
    priority = Column(String(20), default="medium")
    
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    client = relationship("User", back_populates="tickets", foreign_keys=[client_id])
    assigned_admin = relationship("User", foreign_keys=[assigned_admin_id])
    attachments = relationship("TicketAttachment", back_populates="ticket", cascade="all, delete-orphan")
    responses = relationship("TicketResponse", back_populates="ticket", cascade="all, delete-orphan")

class TicketAttachment(Base):
    __tablename__ = "ticket_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50))
    file_size = Column(Integer)
    file_path = Column(String(500), nullable=False)
    extracted_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ticket = relationship("Ticket", back_populates="attachments")

class TicketResponse(Base):
    __tablename__ = "ticket_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    responder_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    original_response = Column(Text, nullable=False)
    response_language = Column(String(10), default="en")
    translated_response = Column(Text)
    target_language = Column(String(10))
    
    ai_suggested = Column(Boolean, default=False)
    ai_suggestion = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ticket = relationship("Ticket", back_populates="responses")
    responder = relationship("User", back_populates="responses")

class TranslationLog(Base):
    __tablename__ = "translation_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    source_text = Column(Text, nullable=False)
    source_language = Column(String(10))
    target_language = Column(String(10))
    translated_text = Column(Text)
    translation_type = Column(String(50))  # 'ticket', 'response', 'suggestion'
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)