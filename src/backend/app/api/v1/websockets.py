"""WebSocket router for real-time pipeline event streaming."""

import asyncio
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.event_bus import event_bus

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/runs/{run_id}")
async def websocket_run_endpoint(websocket: WebSocket, run_id: str):
    """WebSocket stream for real-time agent execution events and logs."""
    await websocket.accept()
    queue = await event_bus.subscribe(run_id)

    # Send initial connection ack
    try:
        await websocket.send_json({
            "event": "connected",
            "run_id": run_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {"message": f"Subscribed to run {run_id} event stream"}
        })
    except Exception as e:
        logger.warning(f"Failed to send initial websocket message: {e}")
        await event_bus.unsubscribe(run_id, queue)
        return

    async def receive_listener():
        """Listen for incoming client pings or control messages."""
        try:
            while True:
                data = await websocket.receive_text()
                # Respond to ping or heartbeat
                try:
                    msg = json.loads(data)
                    if msg.get("type") == "ping":
                        await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
                except Exception:
                    pass
        except (WebSocketDisconnect, asyncio.CancelledError):
            pass

    listener_task = asyncio.create_task(receive_listener())

    try:
        while True:
            # Wait for next event from event_bus
            event = await queue.get()
            await websocket.send_json(event.model_dump())
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from run {run_id}")
    except Exception as e:
        logger.warning(f"Error in WebSocket streaming for run {run_id}: {e}")
    finally:
        listener_task.cancel()
        await event_bus.unsubscribe(run_id, queue)
        try:
            await websocket.close()
        except Exception:
            pass
