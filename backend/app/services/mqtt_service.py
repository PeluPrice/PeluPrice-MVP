import os
import json
import logging
from typing import Optional
import paho.mqtt.client as mqtt
from datetime import datetime

logger = logging.getLogger(__name__)

class MQTTService:
    def __init__(self):
        self.client: Optional[mqtt.Client] = None
        self.host = os.getenv("MQTT_HOST", "localhost")
        self.port = int(os.getenv("MQTT_PORT", "1883"))
        self.username = os.getenv("MQTT_USERNAME", "peluprice")
        self.password = os.getenv("MQTT_PASSWORD", "peluprice123")
        self.client_id = os.getenv("MQTT_CLIENT_ID", "peluprice-backend")
        
    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client = mqtt.Client(client_id=self.client_id)
            
            # Set username and password if provided
            if self.username and self.password:
                self.client.username_pw_set(self.username, self.password)
            
            # Set callbacks
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_message = self._on_message
            self.client.on_publish = self._on_publish
            
            # Connect to broker
            self.client.connect(self.host, self.port, 60)
            self.client.loop_start()
            
            logger.info(f"Connecting to MQTT broker at {self.host}:{self.port}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            logger.info("Disconnected from MQTT broker")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback for when the client receives a CONNACK response from the server"""
        if rc == 0:
            logger.info("Connected to MQTT broker successfully")
            # Subscribe to device topics
            self.client.subscribe("peluprice/devices/+/status")
            self.client.subscribe("peluprice/devices/+/heartbeat")
            self.client.subscribe("peluprice/devices/+/data")
        else:
            logger.error(f"Failed to connect to MQTT broker, return code {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback for when the client disconnects from the server"""
        if rc != 0:
            logger.warning("Unexpected disconnection from MQTT broker")
        else:
            logger.info("Disconnected from MQTT broker")
    
    def _on_message(self, client, userdata, msg):
        """Callback for when a PUBLISH message is received from the server"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            logger.info(f"Received message on topic {topic}: {payload}")
            
            # Handle device messages
            if topic.startswith("peluprice/devices/"):
                self._handle_device_message(topic, payload)
                
        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}")
    
    def _on_publish(self, client, userdata, mid):
        """Callback for when a message is published"""
        logger.debug(f"Message {mid} published successfully")
    
    def _handle_device_message(self, topic: str, payload: dict):
        """Handle messages from devices"""
        # Extract device ID from topic: peluprice/devices/{device_id}/status
        parts = topic.split("/")
        if len(parts) >= 3:
            device_id = parts[2]
            message_type = parts[3] if len(parts) > 3 else "unknown"
            
            logger.info(f"Device {device_id} sent {message_type}: {payload}")
            
            # TODO: Update device status in database
            # TODO: Trigger alerts if needed
            # TODO: Store device data
    
    def publish_to_device(self, device_id: str, command: dict):
        """Publish a command to a specific device"""
        if not self.client:
            logger.error("MQTT client not connected")
            return False
            
        topic = f"peluprice/devices/{device_id}/commands"
        payload = json.dumps({
            **command,
            "timestamp": datetime.utcnow().isoformat(),
            "source": "backend"
        })
        
        try:
            result = self.client.publish(topic, payload, qos=1)
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"Command sent to device {device_id}: {command}")
                return True
            else:
                logger.error(f"Failed to publish command to device {device_id}")
                return False
        except Exception as e:
            logger.error(f"Error publishing command to device {device_id}: {e}")
            return False
    
    def publish_notification(self, topic: str, message: dict):
        """Publish a notification message"""
        if not self.client:
            logger.error("MQTT client not connected")
            return False
            
        payload = json.dumps({
            **message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        try:
            result = self.client.publish(f"peluprice/notifications/{topic}", payload, qos=1)
            return result.rc == mqtt.MQTT_ERR_SUCCESS
        except Exception as e:
            logger.error(f"Error publishing notification: {e}")
            return False

# Global MQTT service instance
mqtt_service = MQTTService()

def get_mqtt_service() -> MQTTService:
    """Get the global MQTT service instance"""
    return mqtt_service
