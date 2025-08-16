#!/bin/bash
set -e

echo "Starting PeluPrice Backend in Production..."

# Wait for database to be ready
echo "Waiting for database connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Database connection attempt $attempt/$max_attempts"
    if python scripts/test_db_connection.py; then
        echo "Database connection successful!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "ERROR: Could not connect to database after $max_attempts attempts"
        exit 1
    fi
    
    attempt=$((attempt + 1))
    sleep 2
done

# Initialize database
echo "Initializing database..."
python scripts/init_db.py

if [ $? -eq 0 ]; then
    echo "Database initialization successful!"
else
    echo "ERROR: Database initialization failed"
    exit 1
fi

# Start the FastAPI application
echo "Starting FastAPI application..."
exec python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
