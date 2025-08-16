#!/bin/bash

# Production startup script for PeluPrice backend

set -e

echo "Starting PeluPrice Backend in Production..."

# Wait for database to be ready
echo "Waiting for database connection..."
MAX_RETRIES=60
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Attempting database connection (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."
    
    # Test if PostgreSQL is accepting connections
    if pg_isready -h db -p 5432 -U peluprice; then
        echo "PostgreSQL is accepting connections..."
        
        # Test actual database connection with authentication
        if PGPASSWORD=peluprice123 psql -h db -p 5432 -U peluprice -d peluprice -c "SELECT 1;" >/dev/null 2>&1; then
            echo "Database connection successful!"
            break
        else
            echo "Database accepting connections but authentication failed, retrying..."
        fi
    else
        echo "Database not ready, waiting..."
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to connect to database after $MAX_RETRIES attempts"
    exit 1
fi

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
