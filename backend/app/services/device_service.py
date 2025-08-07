
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from app import models, schemas

def get_device(db: Session, device_id: str):
    """Get device by ID"""
    return db.query(models.Device).filter(models.Device.id == device_id).first()

def get_device_by_activation_key(db: Session, activation_key: str):
    """Get device by activation key"""
    return db.query(models.Device).filter(models.Device.activation_key == activation_key).first()

def get_user_devices(db: Session, user_id: int):
    """Get all devices owned by a user"""
    return db.query(models.Device).filter(models.Device.owner_id == user_id).all()

def create_device(db: Session, device: schemas.DeviceCreate):
    """Create a new device"""
    db_device = models.Device(
        id=device.id,
        activation_key=device.activation_key,
        name=device.name,
        firmware_version=device.firmware_version,
        hardware_version=device.hardware_version,
        status=models.DeviceStatus.DEPLOYED,
        last_seen=datetime.utcnow()
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def activate_device(db: Session, device_id: str, user_id: int):
    """Activate a device and assign it to a user"""
    device = get_device(db, device_id)
    if not device:
        return None
    
    if device.owner_id:
        raise ValueError("Device already activated")
    
    device.owner_id = user_id
    device.status = models.DeviceStatus.ACTIVATED
    device.activated_at = datetime.utcnow()
    device.is_active = True
    
    if not device.name:
        device.name = f"Device {device.id[-6:]}"
    
    db.commit()
    db.refresh(device)
    return device

def update_device_heartbeat(db: Session, device_id: str, data: dict):
    """Update device heartbeat and status"""
    device = get_device(db, device_id)
    if not device:
        return None
    
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
    if 'firmware_version' in data:
        device.firmware_version = data['firmware_version']
    
    db.commit()
    db.refresh(device)
    return device

def get_offline_devices(db: Session, threshold_minutes: int = 30):
    """Get devices that haven't been seen in the specified time"""
    threshold = datetime.utcnow() - timedelta(minutes=threshold_minutes)
    return db.query(models.Device).filter(
        models.Device.last_seen < threshold,
        models.Device.is_active == True
    ).all()

def mark_device_offline(db: Session, device_id: str):
    """Mark a device as offline"""
    device = get_device(db, device_id)
    if device:
        device.status = models.DeviceStatus.OFFLINE
        device.is_active = False
        db.commit()
        db.refresh(device)
    return device
