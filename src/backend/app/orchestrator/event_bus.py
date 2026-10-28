"""Event bus for publishing and subscribing to live agent pipeline events."""

import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Set, Callable, Coroutine
from app.schemas.websocket import WebSocketEvent


class EventBus:
    """In-memory asynchronous event bus for dispatching run updates to WebSockets."""

    def __init__(self):
        # Maps run_id -> set of asyncio.Queue listeners
        self._subscribers: Dict[str, Set[asyncio.Queue]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, run_id: str) -> asyncio.Queue:
        """Subscribe to live events for a given run."""
        async with self._lock:
            if run_id not in self._subscribers:
                self._subscribers[run_id] = set()
            queue: asyncio.Queue = asyncio.Queue()
            self._subscribers[run_id].add(queue)
            return queue

    async def unsubscribe(self, run_id: str, queue: asyncio.Queue) -> None:
        """Remove a subscriber queue."""
        async with self._lock:
            if run_id in self._subscribers:
                self._subscribers[run_id].discard(queue)
                if not self._subscribers[run_id]:
                    del self._subscribers[run_id]

    async def publish(self, run_id: str, event_type: str, payload: Dict[str, Any]) -> None:
        """Broadcast an event to all subscribers of this run."""
        timestamp = datetime.now(timezone.utc).isoformat()
        event = WebSocketEvent(
            event=event_type,
            timestamp=timestamp,
            run_id=run_id,
            payload=payload,
        )

        async with self._lock:
            queues = list(self._subscribers.get(run_id, set()))

        for q in queues:
            try:
                q.put_nowait(event)
            except Exception:
                pass


event_bus = EventBus()
