
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .api import users, devices
from .ws import websocket
from .services.mqtt_service import mqtt_service

# Load environment variables
load_dotenv()

app = FastAPI(
    title="PeluPrice API",
    description="IoT Device Management Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://peluprice.com",  # Production domain
        "https://www.peluprice.com",  # Production domain with www
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix=f"/api/{os.getenv('API_VERSION', 'v1')}", tags=["users"])
app.include_router(devices.router, prefix=f"/api/{os.getenv('API_VERSION', 'v1')}", tags=["devices"])
app.include_router(websocket.router, tags=["websockets"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to PeluPrice API",
        "version": "1.0.0",
        "domain": os.getenv("DOMAIN", "peluprice.com"),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mqtt_connected": mqtt_service.client and mqtt_service.client.is_connected() if mqtt_service.client else False
    }

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    # Connect to MQTT broker
    mqtt_service.connect()
    
    # TODO: Initialize database tables if needed
    # TODO: Set up any background tasks

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    # Disconnect from MQTT broker
    mqtt_service.disconnect()
