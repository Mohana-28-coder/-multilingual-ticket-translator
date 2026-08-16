from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from .. import models, schemas
from ..auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, 
)
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    if db.query(models.User).filter(models.User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    db_user = models.User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role,
        preferred_language=user_data.preferred_language or "en"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/login", response_model=schemas.Token)
async def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
async def update_profile(
    update_data: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_fields = ["full_name", "preferred_language"]
    
    for field, value in update_data.items():
        if field in allowed_fields and value is not None:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user