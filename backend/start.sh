#!/bin/bash

# Production startup script for PeluPrice backend

set -e

echo "Starting PeluPrice Backend in Production..."

# Database readiness is handled by Docker Compose's healthcheck.
# See docker-compose.prod.yml for details.
echo "Assuming database is ready..."

# Wait for MQTT broker to be ready
echo "Waiting for MQTT broker..."
while ! nc -z mqtt 1883; do
    echo "MQTT broker not ready, waiting..."
    sleep 2
done

echo "MQTT broker is ready!"

# Run database initialization
echo "Initializing database..."
python -c "
import sys
import os

# Ensure proper Python path
sys.path.insert(0, '/app')
sys.path.insert(0, '/app/scripts')

try:
    # Run the init_db script
    exec(open('/app/scripts/init_db.py').read())
    print('Database initialization completed successfully')
except Exception as e:
    print(f'Database initialization error: {e}')
    print('Attempting fallback initialization...')
    
    # Fallback to manual initialization
    try:
        from app.models import Base
        from sqlalchemy import create_engine
        
        DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://peluprice:peluprice123@db:5432/peluprice')
        engine = create_engine(DATABASE_URL)
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        print('Database tables created successfully (fallback)')
    except Exception as fallback_error:
        print(f'Fallback initialization also failed: {fallback_error}')
        exit(1)
"

echo "Starting FastAPI server..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
