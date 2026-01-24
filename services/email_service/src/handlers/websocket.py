"""
WebSocket handler for real-time notifications
Manages connections, emits events, and handles subscriptions
"""
import json
import logging
from datetime import datetime
from typing import Dict, Set, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)


class WebSocketEventType(Enum):
    """WebSocket event types"""
    # Connection
    CONNECT = "connect"
    DISCONNECT = "disconnect"

    # Subscriptions
    SUBSCRIBE = "subscribe"
    UNSUBSCRIBE = "unsubscribe"

    # Notifications
    NEW_MESSAGE = "new_message"
    SYNC_COMPLETE = "sync_complete"
    SYNC_FAILED = "sync_failed"
    ERROR_OCCURRED = "error_occurred"
    MESSAGE_SENT = "message_sent"
    ATTACHMENT_DOWNLOADED = "attachment_downloaded"
    QUOTA_WARNING = "quota_warning"

    # Acknowledgments
    ACK = "ack"
    ERROR = "error"

    # Heartbeat
    PING = "ping"
    PONG = "pong"


@dataclass
class WebSocketMessage:
    """WebSocket message structure"""
    event: str
    data: Dict[str, Any]
    timestamp: int = None
    message_id: Optional[str] = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = int(datetime.utcnow().timestamp() * 1000)

    def to_json(self) -> str:
        """Serialize message to JSON"""
        return json.dumps(asdict(self))

    @staticmethod
    def from_json(json_str: str) -> 'WebSocketMessage':
        """Deserialize message from JSON"""
        try:
            data = json.loads(json_str)
            return WebSocketMessage(
                event=data.get('event'),
                data=data.get('data', {}),
                timestamp=data.get('timestamp'),
                message_id=data.get('messageId'),
            )
        except json.JSONDecodeError as e:
            logger.error(f"Failed to deserialize WebSocket message: {e}")
            raise


class WebSocketConnection:
    """Represents a single WebSocket connection"""

    def __init__(self, sid: str, user_id: str, account_id: str, tenant_id: str):
        """
        Initialize WebSocket connection

        Args:
            sid: Socket ID (unique connection identifier)
            user_id: User ID
            account_id: Email account ID
            tenant_id: Tenant ID for multi-tenancy
        """
        self.sid = sid
        self.user_id = user_id
        self.account_id = account_id
        self.tenant_id = tenant_id
        self.created_at = int(datetime.utcnow().timestamp() * 1000)
        self.subscriptions: Set[str] = set()  # Subscribed rooms/channels
        self.is_authenticated = False
        self.last_heartbeat = self.created_at

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'sid': self.sid,
            'userId': self.user_id,
            'accountId': self.account_id,
            'tenantId': self.tenant_id,
            'createdAt': self.created_at,
            'subscriptions': list(self.subscriptions),
            'isAuthenticated': self.is_authenticated,
            'lastHeartbeat': self.last_heartbeat,
        }

    def subscribe(self, room: str):
        """Subscribe to a room/channel"""
        self.subscriptions.add(room)
        logger.info(f"Connection {self.sid} subscribed to {room}")

    def unsubscribe(self, room: str):
        """Unsubscribe from a room/channel"""
        if room in self.subscriptions:
            self.subscriptions.remove(room)
            logger.info(f"Connection {self.sid} unsubscribed from {room}")

    def update_heartbeat(self):
        """Update last heartbeat timestamp"""
        self.last_heartbeat = int(datetime.utcnow().timestamp() * 1000)


class WebSocketManager:
    """
    Manages WebSocket connections and message routing
    Tracks active connections, rooms, and message delivery
    """

    def __init__(self):
        """Initialize WebSocket manager"""
        self.connections: Dict[str, WebSocketConnection] = {}  # sid -> connection
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> set of sids
        self.rooms: Dict[str, Set[str]] = {}  # room_name -> set of sids
        self.pending_messages: Dict[str, list] = {}  # user_id -> list of messages

    def add_connection(self, connection: WebSocketConnection) -> None:
        """Add a new WebSocket connection"""
        self.connections[connection.sid] = connection

        # Track user connections
        if connection.user_id not in self.user_connections:
            self.user_connections[connection.user_id] = set()
        self.user_connections[connection.user_id].add(connection.sid)

        logger.info(f"Connection added: {connection.sid} for user {connection.user_id}")

    def remove_connection(self, sid: str) -> Optional[WebSocketConnection]:
        """Remove a WebSocket connection"""
        connection = self.connections.pop(sid, None)
        if connection:
            # Remove from user connections
            if connection.user_id in self.user_connections:
                self.user_connections[connection.user_id].discard(sid)
                if not self.user_connections[connection.user_id]:
                    del self.user_connections[connection.user_id]

            # Remove from all rooms
            for room_sids in self.rooms.values():
                room_sids.discard(sid)

            logger.info(f"Connection removed: {sid} for user {connection.user_id}")

        return connection

    def get_connection(self, sid: str) -> Optional[WebSocketConnection]:
        """Get connection by socket ID"""
        return self.connections.get(sid)

    def subscribe_to_room(self, sid: str, room: str) -> bool:
        """Subscribe connection to a room"""
        connection = self.get_connection(sid)
        if not connection:
            return False

        connection.subscribe(room)

        if room not in self.rooms:
            self.rooms[room] = set()
        self.rooms[room].add(sid)

        logger.info(f"Subscribed {sid} to room {room}")
        return True

    def unsubscribe_from_room(self, sid: str, room: str) -> bool:
        """Unsubscribe connection from a room"""
        connection = self.get_connection(sid)
        if not connection:
            return False

        connection.unsubscribe(room)

        if room in self.rooms:
            self.rooms[room].discard(sid)
            if not self.rooms[room]:
                del self.rooms[room]

        logger.info(f"Unsubscribed {sid} from room {room}")
        return True

    def get_user_connections(self, user_id: str) -> list:
        """Get all active connections for a user"""
        sids = self.user_connections.get(user_id, set())
        return [self.connections[sid] for sid in sids if sid in self.connections]

    def get_room_connections(self, room: str) -> list:
        """Get all connections subscribed to a room"""
        sids = self.rooms.get(room, set())
        return [self.connections[sid] for sid in sids if sid in self.connections]

    def queue_message(self, user_id: str, message: WebSocketMessage) -> None:
        """Queue a message for delivery (for offline users)"""
        if user_id not in self.pending_messages:
            self.pending_messages[user_id] = []
        self.pending_messages[user_id].append(message)

    def get_pending_messages(self, user_id: str) -> list:
        """Get and clear pending messages for a user"""
        messages = self.pending_messages.get(user_id, [])
        self.pending_messages[user_id] = []
        return messages

    def get_stats(self) -> Dict[str, Any]:
        """Get WebSocket manager statistics"""
        return {
            'totalConnections': len(self.connections),
            'totalUsers': len(self.user_connections),
            'totalRooms': len(self.rooms),
            'pendingMessages': sum(len(msgs) for msgs in self.pending_messages.values()),
            'connections': {
                sid: conn.to_dict()
                for sid, conn in self.connections.items()
            },
        }


# Global WebSocket manager instance
ws_manager = WebSocketManager()


def get_ws_manager() -> WebSocketManager:
    """Get global WebSocket manager instance"""
    return ws_manager
