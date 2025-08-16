#!/usr/bin/env python3
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

def test_db_connection():
    """Test database connection without importing models."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL environment variable not set.")
        return False

    try:
        engine = create_engine(db_url)
        with engine.connect() as connection:
            # Test basic connection with a simple query
            result = connection.execute(text("SELECT 1"))
            return True
    except OperationalError as e:
        print(f"Database connection failed: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

if __name__ == "__main__":
    if test_db_connection():
        print("Database connection test: PASSED")
        sys.exit(0)
    else:
        print("Database connection test: FAILED")
        sys.exit(1)
