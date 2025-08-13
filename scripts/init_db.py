#!/usr/bin/env python3
"""
PeluPrice Database Initialization Script
Creates all necessary tables and initial data
Run with: uv run scripts/init_db.py
"""

import os
import sys
from pathlib import Path

# Add the backend app to Python path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from sqlalchemy import create_engine, text
from app.models.user import Base
from app.models.device import Device  # Import to register the model

def create_database():
    """Create database and all tables"""
    database_url = os.getenv("DATABASE_URL", "sqlite:///./peluprice.db")
    
    print(f"Creating database: {database_url}")
    
    engine = create_engine(database_url)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database tables created successfully")
    
    # Create initial data if needed
    with engine.connect() as conn:
        # Check if we need to add any initial data
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        user_count = result.scalar()
        
        if user_count == 0:
            print("Creating initial admin user...")
            # TODO: Add initial admin user creation
            print("⚠️ Remember to create an admin user through the API")
    
    print("✅ Database initialization complete")

if __name__ == "__main__":
    create_database()
