import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.get_db import get_db
from app.models import Base
from app.database import engine

app = FastAPI(
    title="PeluPrice API",
    description="API for PeluPrice project",
    version=os.getenv("API_VERSION", "v1"),
)

@app.get("/health", summary="Health Check", tags=["Health"])
def health_check():
    """
    Health check endpoint to ensure the API is running.
    """
    return {"status": "ok"}

@app.post("/init-db", summary="Initialize Database", tags=["Admin"])
def init_database():
    """
    Initialize database tables. Call this endpoint after deployment.
    """
    try:
        Base.metadata.create_all(bind=engine)
        return {"status": "success", "message": "Database tables created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")

# Include routers
from app.api import users, devices, auth

app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(devices.router, prefix="/api/v1", tags=["Devices"])
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)