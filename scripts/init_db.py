import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import time

# Add the app directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.models import Base  # Assuming your models are defined here

def get_db_engine():
    """Creates a SQLAlchemy engine with retry logic."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL environment variable not set.")
        sys.exit(1)

    print("Connecting to the database...")
    for i in range(10):
        try:
            engine = create_engine(db_url)
            with engine.connect() as connection:
                print("Database connection successful!")
                return engine
        except OperationalError as e:
            print(f"Database connection failed (attempt {i+1}/10): {e}")
            time.sleep(3)
    
    print("ERROR: Could not connect to the database after multiple retries.")
    sys.exit(1)

def initialize_database():
    """Initializes the database by creating all tables."""
    print("Initializing database...")
    engine = get_db_engine()
    
    try:
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")
    except Exception as e:
        print(f"An error occurred during table creation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    initialize_database()