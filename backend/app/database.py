
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://peluprice:peluprice123@db:5432/peluprice")

# Create engine with lazy connection - don't connect until first use
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 10})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
