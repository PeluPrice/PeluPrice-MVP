
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use environment variable for database URL, fallback to SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./peluprice.db")

# SQLite-specific connection args only apply if using SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
