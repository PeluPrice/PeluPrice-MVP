
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.database import SessionLocal
from fastapi import HTTPException

def get_db():
    try:
        db = SessionLocal()
        yield db
    except OperationalError as e:
        raise HTTPException(status_code=503, detail="Database connection failed. Please try again later.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred.")
    finally:
        try:
            db.close()
        except:
            pass
