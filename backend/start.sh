#!/bin/bash

# Production startup script for PeluPrice backend

set -e

echo "Starting PeluPrice Backend in Production..."

# Wait for database to be ready
echo "Waiting for database connection..."
while ! pg_isready -h db -p 5432 -U peluprice; do
    echo "Database not ready, waiting..."
    sleep 2
done

echo "Database is ready!"

# Wait for MQTT broker to be ready
echo "Waiting for MQTT broker..."
while ! nc -z mqtt 1883; do
    echo "MQTT broker not ready, waiting..."
    sleep 2
done

echo "MQTT broker is ready!"

# Run database migrations if needed
echo "Running database setup..."
python -c "
import os
from sqlalchemy import create_engine, text
from app.models import Base

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://peluprice:peluprice123@db:5432/peluprice')
engine = create_engine(DATABASE_URL)

try:
    # Test connection
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
    print('Database connection successful')
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print('Database tables created/updated')
except Exception as e:
    print(f'Database setup error: {e}')
    exit(1)
"

echo "Starting FastAPI server..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
