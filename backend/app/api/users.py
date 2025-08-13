
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app import models, schemas
from app.services.get_db import get_db
from app.services import user_service
from app.auth.auth import get_current_active_user
from typing import List
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()
from app.auth.auth import get_current_active_user
from typing import List
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user (public endpoint for registration)"""
    try:
        # Check if user already exists
        db_user = user_service.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email already registered"
            )
        
        # Validate email format
        if "@" not in user.email or "." not in user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password strength
        if len(user.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        return user_service.create_user(db=db, user=user)
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        logger.error(f"Unexpected error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.get("/users/", response_model=List[schemas.User])
def list_users(
    skip: int = 0, 
    limit: int = 100, 
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of users (protected endpoint - requires authentication)"""
    try:
        users = db.query(models.User).offset(skip).limit(limit).all()
        return users
    except SQLAlchemyError as e:
        logger.error(f"Database error listing users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        logger.error(f"Unexpected error listing users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.get("/users/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int, 
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (protected endpoint - requires authentication)"""
    try:
        # Check if user is requesting their own data or has admin privileges
        if current_user.id != user_id:
            # For now, allow all authenticated users to view other users
            # In the future, you can add role-based access control here
            pass
            
        db_user = user_service.get_user(db, user_id=user_id)
        if db_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="User not found"
            )
        return db_user
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error getting user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        logger.error(f"Unexpected error getting user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )
