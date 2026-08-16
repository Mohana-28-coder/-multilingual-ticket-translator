from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_admin
from ..services.ai_service import ai_service
from ..services.translation_service import translation_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/kpi", response_model=schemas.KPIResponse)
async def get_kpi_stats(
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    # Total tickets
    total_tickets = db.query(func.count(models.Ticket.id)).scalar()
    
    # Tickets today
    tickets_today = db.query(func.count(models.Ticket.id)).filter(
        models.Ticket.created_at >= today_start
    ).scalar()
    
    # Pending tickets
    pending_tickets = db.query(func.count(models.Ticket.id)).filter(
        models.Ticket.status == models.TicketStatus.PENDING
    ).scalar()
    
    # Resolved tickets
    resolved_tickets = db.query(func.count(models.Ticket.id)).filter(
        models.Ticket.status == models.TicketStatus.RESOLVED
    ).scalar()
    
    # Awaiting translation (non-English pending tickets)
    awaiting_translation = db.query(func.count(models.Ticket.id)).filter(
        models.Ticket.original_language != 'en',
        models.Ticket.status.in_([models.TicketStatus.PENDING, models.TicketStatus.DELIVERED])
    ).scalar()
    
    # Average resolution time
    resolved = db.query(models.Ticket).filter(
        models.Ticket.resolved_at.isnot(None),
        models.Ticket.resolved_at > models.Ticket.created_at
    ).all()
    
    if resolved:
        total_hours = sum(
            (t.resolved_at - t.created_at).total_seconds() / 3600
            for t in resolved
        )
        avg_resolution_time = total_hours / len(resolved)
    else:
        avg_resolution_time = None
    
    return schemas.KPIResponse(
        total_tickets=total_tickets or 0,
        tickets_today=tickets_today or 0,
        pending_tickets=pending_tickets or 0,
        resolved_tickets=resolved_tickets or 0,
        awaiting_translation=awaiting_translation or 0,
        average_resolution_time=round(avg_resolution_time, 2) if avg_resolution_time else None
    )

@router.get("/tickets", response_model=List[schemas.TicketListResponse])
async def get_all_tickets(
    status: str = None,
    priority: str = None,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(models.Ticket)
    
    if status:
        query = query.filter(models.Ticket.status == status)
    if priority:
        query = query.filter(models.Ticket.priority == priority)
    
    # Order by created_at for FIFO
    tickets = query.order_by(models.Ticket.created_at.asc()).all()
    return tickets

@router.get("/tickets/{ticket_id}/suggestion")
async def get_ai_suggestion(
    ticket_id: int,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Get previous responses
    previous_responses = [r.original_response for r in ticket.responses]
    
    # Generate AI suggestion in English
    suggestion = await ai_service.generate_response_suggestion(
        ticket.translated_subject or ticket.subject,
        ticket.translated_description or ticket.description,
        previous_responses
    )
    
    # Translate suggestion to client's language if needed
    translated_suggestion = None
    if ticket.original_language and ticket.original_language != 'en':
        translated_suggestion = translation_service.translate_from_english(
            suggestion,
            ticket.original_language
        )
    
    return {
        "suggestion": suggestion,
        "translated_suggestion": translated_suggestion,
        "target_language": ticket.original_language,
        "language_name": ticket.detected_language
    }

@router.post("/tickets/{ticket_id}/respond")
async def respond_to_ticket(
    ticket_id: int,
    response_data: schemas.TicketResponseCreate,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Get the response text (either custom or AI suggestion)
    response_text = response_data.original_response
    
    # Translate to client's language if needed
    translated_response = None
    if ticket.original_language and ticket.original_language != 'en':
        translated_response = translation_service.translate_from_english(
            response_text,
            ticket.original_language
        )
    
    # Create response record
    ticket_response = models.TicketResponse(
        ticket_id=ticket_id,
        responder_id=current_user.id,
        original_response=response_text,
        response_language='en',
        translated_response=translated_response,
        target_language=ticket.original_language,
        ai_suggested=response_data.use_ai_suggestion,
        ai_suggestion=response_data.ai_suggestion
    )
    
    db.add(ticket_response)
    
    # Update ticket status
    if ticket.status == models.TicketStatus.PENDING:
        ticket.status = models.TicketStatus.REVIEWED
    
    ticket.updated_at = datetime.utcnow()
    ticket.assigned_admin_id = current_user.id
    
    db.commit()
    db.refresh(ticket_response)
    
    return {
        "message": "Response sent successfully",
        "response": {
            "id": ticket_response.id,
            "original_response": ticket_response.original_response,
            "translated_response": ticket_response.translated_response,
            "target_language": ticket_response.target_language
        }
    }