#!/usr/bin/env python3
"""
Simple database initialization for Docker production deployment
"""

import os
import sys
import time
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add app to path
sys.path.insert(0, '/app')

def wait_for_db():
    """Wait for database to be ready"""
    from sqlalchemy import create_engine, text
    
    database_url = os.getenv("DATABASE_URL", "postgresql://peluprice:peluprice123@db:5432/peluprice")
    
    for attempt in range(30):  # Wait up to 60 seconds
        try:
            engine = create_engine(database_url)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            return engine
        except Exception as e:
            logger.info(f"Database not ready (attempt {attempt + 1}/30): {e}")
            time.sleep(2)
    
    raise Exception("Database not available after 60 seconds")

def initialize_database():
    """Initialize database tables and data"""
    try:
        # Wait for database
        engine = wait_for_db()
        
        # Import models to register them
        from app.models import Base, User, Device
        
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        
        # Check and create initial data
        with engine.connect() as conn:
            # Check if devices table has data
            from sqlalchemy import text
            device_result = conn.execute(text("SELECT COUNT(*) FROM devices"))
            device_count = device_result.scalar()
            
            if device_count == 0:
                logger.info("Creating test devices for demo...")
                # Insert test devices using PostgreSQL syntax
                test_devices = [
                    {
                        'id': 'test-device-001',
                        'activation_key': 'DEMO123',
                        'status': 'deployed',
                        'firmware_version': '1.0.0',
                        'hardware_version': '1.0.0'
                    },
                    {
                        'id': 'test-device-002', 
                        'activation_key': 'DEMO456',
                        'status': 'deployed',
                        'firmware_version': '1.0.0',
                        'hardware_version': '1.0.0'
                    },
                    {
                        'id': 'test-device-003',
                        'activation_key': 'DEMO789', 
                        'status': 'deployed',
                        'firmware_version': '1.0.0',
                        'hardware_version': '1.0.0'
                    }
                ]
                
                for device in test_devices:
                    conn.execute(text("""
                        INSERT INTO devices (id, activation_key, status, firmware_version, hardware_version, created_at)
                        VALUES (:id, :activation_key, :status, :firmware_version, :hardware_version, NOW())
                    """), device)
                
                conn.commit()
                logger.info("✅ Test devices created with activation keys: DEMO123, DEMO456, DEMO789")
            else:
                logger.info(f"Database already has {device_count} devices, skipping initialization")
        
        logger.info("✅ Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    initialize_database()
