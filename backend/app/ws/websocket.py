
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        del self.active_connections[client_id]

    async def send_personal_message(self, message: str, client_id: str):
        await self.active_connections[client_id].send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/devices/{uuid}")
async def websocket_endpoint(websocket: WebSocket, uuid: str):
    await manager.connect(websocket, uuid)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", uuid)
    except WebSocketDisconnect:
        manager.disconnect(uuid)
