from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import uuid
import logging

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, get_current_client
from ..services.translation_service import translation_service
from ..services.file_service import file_service
from ..services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

def generate_ticket_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    unique_id = uuid.uuid4().hex[:6].upper()
    return f"TKT-{timestamp}-{unique_id}"

@router.post("/", response_model=schemas.TicketResponse)
async def create_ticket(
    subject: str = Form(...),
    description: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    current_user: models.User = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    combined_text = f"{subject} {description}"
    lang_code, lang_name, confidence = translation_service.detect_language(combined_text)
    logger.info(f"Ticket language detected: {lang_code} ({lang_name})")

    translated_subject = subject
    translated_description = description

    if lang_code != 'en':
        translated_subject, _ = translation_service.translate_to_english(subject, lang_code)
        translated_description, _ = translation_service.translate_to_english(description, lang_code)
        logger.info(f"Ticket translated from {lang_code} to English")

    sentiment = await ai_service.analyze_sentiment(translated_description)

    ticket = models.Ticket(
        ticket_number=generate_ticket_number(),
        subject=subject,
        description=description,
        original_language=lang_code,
        detected_language=lang_name,
        translated_subject=translated_subject,
        translated_description=translated_description,
        client_id=current_user.id,
        priority=sentiment.get("suggested_priority", "medium"),
        status=models.TicketStatus.PENDING
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    for file in files:
        if file.filename:
            try:
                saved_filename, original_filename, file_size, file_type = await file_service.save_file(file)
                logger.info(f"File saved: {original_filename} as {saved_filename}")

                extracted_text = file_service.extract_text(saved_filename)
                logger.info(f"Extracted text length: {len(extracted_text) if extracted_text else 0}")

                translated_extracted_text = None
                if extracted_text:
                    detected_file_lang, detected_file_name, _ = translation_service.detect_language(extracted_text)
                    logger.info(f"File language detected: {detected_file_lang} ({detected_file_name})")

                    if detected_file_lang != 'en':
                        logger.info(f"Translating file from {detected_file_lang} to English...")
                        translated_extracted_text, _ = translation_service.translate_to_english(
                            extracted_text, detected_file_lang
                        )
                        logger.info(f"File translation done: {translated_extracted_text[:100] if translated_extracted_text else 'FAILED'}")
                    else:
                        logger.info("File is already in English")

                final_text = translated_extracted_text if translated_extracted_text else extracted_text
                logger.info(f"Final stored text: {final_text[:100] if final_text else 'None'}")

                attachment = models.TicketAttachment(
                    ticket_id=ticket.id,
                    filename=saved_filename,
                    original_filename=original_filename,
                    file_type=file_type,
                    file_size=file_size,
                    file_path=str(file_service.upload_dir / saved_filename),
                    extracted_text=final_text
                )
                db.add(attachment)

            except Exception as e:
                logger.error(f"File processing error: {e}")

    db.commit()
    db.refresh(ticket)

    return ticket

@router.get("/", response_model=List[schemas.TicketListResponse])
async def get_user_tickets(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == models.UserRole.ADMIN:
        tickets = db.query(models.Ticket).order_by(desc(models.Ticket.created_at)).all()
    else:
        tickets = db.query(models.Ticket).filter(
            models.Ticket.client_id == current_user.id
        ).order_by(desc(models.Ticket.created_at)).all()
    return tickets

@router.get("/{ticket_id}", response_model=schemas.TicketResponse)
async def get_ticket(
    ticket_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if current_user.role != models.UserRole.ADMIN and ticket.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return ticket

@router.put("/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: int,
    status_update: schemas.TicketUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can update ticket status")

    if status_update.status:
        ticket.status = status_update.status
        if status_update.status == models.TicketStatus.RESOLVED:
            ticket.resolved_at = datetime.utcnow()

    if status_update.priority:
        ticket.priority = status_update.priority

    ticket.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "Ticket updated successfully", "status": ticket.status}