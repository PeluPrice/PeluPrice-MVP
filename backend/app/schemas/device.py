
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

# Device status enum - matching model enum values
class DeviceStatus(str, Enum):
    CREATED = "CREATED"
    DEPLOYED = "DEPLOYED"
    DELIVERED = "DELIVERED"
    ACTIVATED = "ACTIVATED"
    WORKING = "WORKING"
    OFFLINE = "OFFLINE"
    ERROR = "ERROR"

class DeviceBase(BaseModel):
    name: Optional[str] = None

class DeviceCreate(DeviceBase):
    id: str
    activation_key: str
    firmware_version: Optional[str] = None
    hardware_version: Optional[str] = None

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    firmware_version: Optional[str] = None
    hardware_version: Optional[str] = None

class Device(DeviceBase):
    id: str
    activation_key: str
    owner_id: Optional[int] = None
    status: DeviceStatus
    is_active: bool
    created_at: datetime
    activated_at: Optional[datetime] = None
    last_seen: datetime
    firmware_version: Optional[str] = None
    hardware_version: Optional[str] = None
    ip_address: Optional[str] = None
    signal_strength: Optional[int] = None
    battery_level: Optional[int] = None

    class Config:
        from_attributes = True
