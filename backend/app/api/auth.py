from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.services.get_db import get_db
from app.services.user_service import get_user_by_email, create_user, verify_password
from app.auth.auth import create_access_token, get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app import schemas

router = APIRouter()

@router.post("/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
        )
    
    # Create new user
    return create_user(db=db, user=user)

@router.post("/auth/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    user = get_user_by_email(db, email=form_data.username)  # username field contains email
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }

@router.get("/auth/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
    """Get current user profile"""
    return current_user
