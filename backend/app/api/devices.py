
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app import models, schemas
from app.services.get_db import get_db
from app.services import device_service

router = APIRouter()

# Device registration from hardware
class DeviceRegistration(BaseModel):
    device_id: str
    activation_key: str
    firmware_version: Optional[str] = None
    hardware_version: Optional[str] = None

# Device activation by user
class DeviceActivation(BaseModel):
    activation_key: str

@router.post("/device/register")
def register_device(registration: DeviceRegistration, db: Session = Depends(get_db)):
    """
    Register a device from hardware. This is called by the device itself.
    The device provides its UUID and activation key.
    """
    # Check if device already exists
    existing_device = device_service.get_device(db, device_id=registration.device_id)
    if existing_device:
        # Update last seen and status to working
        existing_device.last_seen = datetime.utcnow()
        existing_device.status = models.DeviceStatus.WORKING if existing_device.owner_id else models.DeviceStatus.DEPLOYED
        existing_device.firmware_version = registration.firmware_version
        existing_device.hardware_version = registration.hardware_version
        db.commit()
        return {"message": "Device updated", "device_id": registration.device_id, "status": existing_device.status.value}
    
    # Check if activation key already exists
    existing_key = db.query(models.Device).filter(models.Device.activation_key == registration.activation_key).first()
    if existing_key:
        raise HTTPException(status_code=400, detail="Activation key already exists")
    
    # Create new device
    new_device = models.Device(
        id=registration.device_id,
        activation_key=registration.activation_key,
        status=models.DeviceStatus.DEPLOYED,
        firmware_version=registration.firmware_version,
        hardware_version=registration.hardware_version,
        last_seen=datetime.utcnow()
    )
    
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    
    return {"message": "Device registered successfully", "device_id": registration.device_id, "status": "deployed"}

@router.post("/device/activate")
def activate_device(activation: DeviceActivation, current_user = None, db: Session = Depends(get_db)):
    """
    Activate a device by entering the activation key. This assigns the device to a user.
    TODO: Add authentication to get current_user
    """
    # For now, using placeholder user_id = 1
    # In production, get user_id from JWT token
    user_id = 1
    
    # Find device by activation key
    device = db.query(models.Device).filter(models.Device.activation_key == activation.activation_key).first()
    if not device:
        raise HTTPException(status_code=404, detail="Invalid activation key")
    
    # Check if device is already activated
    if device.owner_id:
        raise HTTPException(status_code=400, detail="Device already activated by another user")
    
    # Activate device
    device.owner_id = user_id
    device.status = models.DeviceStatus.ACTIVATED
    device.activated_at = datetime.utcnow()
    device.is_active = True
    
    # Set a default name if none provided
    if not device.name:
        device.name = f"Device {device.id[-6:]}"
    
    db.commit()
    db.refresh(device)
    
    return {
        "message": "Device activated successfully",
        "device_id": device.id,
        "device_name": device.name,
        "status": device.status.value
    }

@router.get("/devices/", response_model=List[schemas.Device])
def list_user_devices(current_user = None, db: Session = Depends(get_db)):
    """
    List all devices owned by the current user.
    TODO: Add authentication to get current_user
    """
    # For now, using placeholder user_id = 1
    user_id = 1
    
    devices = db.query(models.Device).filter(models.Device.owner_id == user_id).all()
    return devices

@router.get("/devices/{device_id}", response_model=schemas.Device)
def read_device(device_id: str, db: Session = Depends(get_db)):
    """Get device details by ID"""
    db_device = device_service.get_device(db, device_id=device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device

@router.post("/devices/{device_id}/trigger")
def trigger_device_action(device_id: str, action: dict, db: Session = Depends(get_db)):
    """
    Trigger an action on a device (alarm, speak, led)
    TODO: Implement MQTT publishing to send command to device
    """
    device = device_service.get_device(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # TODO: Add MQTT publishing logic here
    # mqtt_client.publish(f"peluprice/devices/{device_id}/commands", json.dumps(action))
    
    return {"message": f"Action {action.get('type', 'unknown')} triggered for device {device_id}"}

@router.put("/devices/{device_id}/heartbeat")
def device_heartbeat(device_id: str, data: dict, db: Session = Depends(get_db)):
    """
    Update device heartbeat and status information
    """
    device = device_service.get_device(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Update device status
    device.last_seen = datetime.utcnow()
    device.status = models.DeviceStatus.WORKING
    device.is_active = True
    
    # Update optional fields
    if 'ip_address' in data:
        device.ip_address = data['ip_address']
    if 'signal_strength' in data:
        device.signal_strength = data['signal_strength']
    if 'battery_level' in data:
        device.battery_level = data['battery_level']
    
    db.commit()
    
    return {"message": "Heartbeat updated", "last_seen": device.last_seen}
