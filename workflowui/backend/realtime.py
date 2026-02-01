"""
Real-time Collaboration Server
WebSocket support for live canvas syncing with presence indicators
"""

from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
from datetime import datetime
import json
from typing import Dict, Set

# Global tracking of connected users per project
project_sessions: Dict[str, Set[dict]] = {}

def init_realtime(app):
    """Initialize SocketIO for Flask app"""
    socketio = SocketIO(
        app,
        cors_allowed_origins="*",
        async_mode='threading'
    )

    @socketio.on('connect')
    def handle_connect():
        """Handle client connection"""
        print(f'Client connected: {socketio.server.environ["REMOTE_ADDR"]}')
        emit('connection_response', {'data': 'Connected to server'})

    @socketio.on('join_project')
    def on_join_project(data):
        """Join a project collaboration room"""
        project_id = data.get('projectId')
        user_id = data.get('userId')
        user_name = data.get('userName')
        user_color = data.get('userColor', '#1976d2')

        room_name = f'project:{project_id}'
        join_room(room_name)

        # Track user in project
        if project_id not in project_sessions:
            project_sessions[project_id] = set()

        user_info = {
            'userId': user_id,
            'userName': user_name,
            'userColor': user_color,
            'connectedAt': datetime.now().isoformat()
        }

        project_sessions[project_id].add(json.dumps(user_info))

        # Broadcast user joined event
        emit('user_joined', {
            'userId': user_id,
            'userName': user_name,
            'userColor': user_color,
            'usersCount': len(project_sessions[project_id])
        }, room=room_name, skip_sid=socketio.server.environ.get('REMOTE_ADDR'))

        print(f'User {user_name} joined project {project_id}')

    @socketio.on('canvas_update')
    def on_canvas_update(data):
        """Broadcast canvas item position/size changes"""
        project_id = data.get('projectId')
        room_name = f'project:{project_id}'

        # Broadcast to other users (skip sender)
        emit('canvas_updated', {
            'userId': data.get('userId'),
            'itemId': data.get('itemId'),
            'position': data.get('position'),
            'size': data.get('size'),
            'timestamp': datetime.now().isoformat()
        }, room=room_name, skip_sid=socketio.server.environ.get('REMOTE_ADDR'))

    @socketio.on('cursor_move')
    def on_cursor_move(data):
        """Broadcast user cursor position"""
        project_id = data.get('projectId')
        room_name = f'project:{project_id}'

        emit('cursor_moved', {
            'userId': data.get('userId'),
            'userName': data.get('userName'),
            'userColor': data.get('userColor'),
            'position': data.get('position'),
            'timestamp': datetime.now().isoformat()
        }, room=room_name, skip_sid=socketio.server.environ.get('REMOTE_ADDR'))

    @socketio.on('item_locked')
    def on_item_locked(data):
        """Notify others that a user is editing an item"""
        project_id = data.get('projectId')
        room_name = f'project:{project_id}'

        emit('item_locked', {
            'userId': data.get('userId'),
            'itemId': data.get('itemId'),
            'userName': data.get('userName'),
            'userColor': data.get('userColor')
        }, room=room_name, skip_sid=socketio.server.environ.get('REMOTE_ADDR'))

    @socketio.on('item_released')
    def on_item_released(data):
        """Notify others that a user released an item"""
        project_id = data.get('projectId')
        room_name = f'project:{project_id}'

        emit('item_released', {
            'userId': data.get('userId'),
            'itemId': data.get('itemId')
        }, room=room_name, skip_sid=socketio.server.environ.get('REMOTE_ADDR'))

    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnect"""
        print('Client disconnected')

        # Clean up project sessions
        for project_id in list(project_sessions.keys()):
            if len(project_sessions[project_id]) == 0:
                del project_sessions[project_id]

    return socketio
