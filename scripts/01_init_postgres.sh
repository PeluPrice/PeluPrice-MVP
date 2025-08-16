#!/bin/bash
# PostgreSQL initialization script
# This runs when the database is first created

set -e

echo "Initializing PeluPrice database..."

# Create additional schemas or run initial setup if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Ensure the database is ready for connections
    SELECT 'Database initialized successfully' as status;
EOSQL

echo "Database initialization complete!"
