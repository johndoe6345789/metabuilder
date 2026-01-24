"""
Third-party integrations package
- socketio: Flask-SocketIO for real-time WebSocket notifications
"""
from .socketio import init_socketio

__all__ = ['init_socketio']
