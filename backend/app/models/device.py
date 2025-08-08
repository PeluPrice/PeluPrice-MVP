
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLAlchemyEnum, Boolean
from sqlalchemy.orm import relationship
from .user import Base
from datetime import datetime
import enum

class DeviceStatus(enum.Enum):
    CREATED = "created"       # Device created in system, not yet deployed
    DEPLOYED = "deployed"     # Device physically deployed with card
    DELIVERED = "delivered"   # Device delivered to end user
    ACTIVATED = "activated"   # User activated device with key
    WORKING = "working"       # Device is actively working and connected
    OFFLINE = "offline"       # Device is offline/disconnected
    ERROR = "error"          # Device has error status

class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, index=True)  # UUID from device
    name = Column(String, nullable=True)
    activation_key = Column(String, unique=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null until activated
    status = Column(SQLAlchemyEnum(DeviceStatus), default=DeviceStatus.CREATED)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    activated_at = Column(DateTime, nullable=True)  # When user activated it
    last_seen = Column(DateTime, default=datetime.utcnow)
    
    # Device metadata
    firmware_version = Column(String, nullable=True)
    hardware_version = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    signal_strength = Column(Integer, nullable=True)
    battery_level = Column(Integer, nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="devices")
