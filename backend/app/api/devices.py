
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app import models, schemas
from app.services.get_db import get_db
from app.services import device_service
from app.auth.auth import get_current_active_user
import logging

# Set up logging
logger = logging.getLogger(__name__)

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
    This endpoint is public (no authentication required).
    """
    try:
        # Check if device already exists
        existing_device = device_service.get_device(db, device_id=registration.device_id)
        if existing_device:
            # Update last seen and status to working
            existing_device.last_seen = datetime.utcnow()
            existing_device.status = models.DeviceStatus.WORKING if existing_device.owner_id else models.DeviceStatus.DEPLOYED
            existing_device.firmware_version = registration.firmware_version
            existing_device.hardware_version = registration.hardware_version
            db.commit()
            return {
                "message": "Device updated", 
                "device_id": registration.device_id, 
                "status": existing_device.status.value
            }
        
        # Check if activation key already exists
        existing_key = db.query(models.Device).filter(models.Device.activation_key == registration.activation_key).first()
        if existing_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Activation key already exists"
            )
        
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
        
        return {
            "message": "Device registered successfully", 
            "device_id": registration.device_id, 
            "status": "deployed"
        }
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error registering device {registration.device_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        logger.error(f"Unexpected error registering device {registration.device_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.post("/device/activate")
def activate_device(
    activation: DeviceActivation, 
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Activate a device by associating it with the current user.
    Requires authentication.
    """
    try:
        # Find device by activation key
        device = db.query(models.Device).filter(models.Device.activation_key == activation.activation_key).first()
        
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Invalid activation key"
            )
        
        # Check if device is already activated
        if device.owner_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Device already activated"
            )
        
        # Activate device
        device.owner_id = current_user.id
        device.status = models.DeviceStatus.WORKING
        device.name = f"Device {device.id[:8]}"  # Default name
        device.last_seen = datetime.utcnow()
        
        db.commit()
        db.refresh(device)
        
        return {
            "message": "Device activated successfully",
            "device_id": device.id,
            "device_name": device.name,
            "status": device.status.value
        }
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error activating device: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        logger.error(f"Unexpected error activating device: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.get("/devices/", response_model=List[schemas.Device])
def list_user_devices(
    current_user: schemas.User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    """
    List all devices owned by the current user.
    Requires authentication.
    """
    try:
        logger.info(f"Getting devices for user {current_user.id}")
        devices = db.query(models.Device).filter(models.Device.owner_id == current_user.id).all()
        logger.info(f"Found {len(devices)} devices")
        
        # Convert each device to dict and handle enum manually
        result = []
        for device in devices:
            device_dict = {
                "id": device.id,
                "name": device.name,
                "activation_key": device.activation_key,
                "owner_id": device.owner_id,
                "status": device.status.value if device.status else "DEPLOYED",  # Convert enum to string
                "is_active": device.is_active or False,
                "created_at": device.created_at,
                "activated_at": device.activated_at,
                "last_seen": device.last_seen,
                "firmware_version": device.firmware_version,
                "hardware_version": device.hardware_version,
                "ip_address": device.ip_address,
                "signal_strength": device.signal_strength,
                "battery_level": device.battery_level
            }
            result.append(device_dict)
        
        return result
        
    except SQLAlchemyError as e:
        logger.error(f"Database error listing devices for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        logger.error(f"Unexpected error listing devices for user {current_user.id}: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/devices/{device_id}", response_model=schemas.Device)
def read_device(
    device_id: str, 
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get device details by ID (requires authentication)"""
    try:
        db_device = device_service.get_device(db, device_id=device_id)
        if db_device is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Device not found"
            )
        
        # Check if user owns this device
        if db_device.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this device"
            )
            
        return db_device
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error getting device {device_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        logger.error(f"Unexpected error getting device {device_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.post("/devices/{device_id}/trigger")
def trigger_device_action(
    device_id: str, 
    action: dict, 
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Trigger an action on a device (alarm, speak, led)
    Requires authentication and device ownership.
    """
    try:
        device = device_service.get_device(db, device_id=device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Device not found"
            )
        
        # Check if user owns this device
        if device.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this device"
            )
        
        # TODO: Add MQTT publishing logic here
        # mqtt_client.publish(f"peluprice/devices/{device_id}/commands", json.dumps(action))
        
        return {
            "message": f"Action {action.get('type', 'unknown')} triggered for device {device_id}",
            "device_id": device_id,
            "action": action
        }
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error triggering action on device {device_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        logger.error(f"Unexpected error triggering action on device {device_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

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
