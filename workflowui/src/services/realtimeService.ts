/**
 * Realtime Service
 * WebSocket client for real-time collaboration
 */

import { io, Socket } from 'socket.io-client';

export interface RemoteUser {
  userId: string;
  userName: string;
  userColor: string;
  connectedAt: string;
}

export interface RemoteCursor {
  userId: string;
  userName: string;
  userColor: string;
  position: { x: number; y: number };
  timestamp: string;
}

export type RealtimeListener = (data: any) => void;

class RealtimeService {
  private socket: Socket | null = null;
  private currentProjectId: string | null = null;
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  private currentUserColor: string | null = null;
  private listeners: Map<string, Set<RealtimeListener>> = new Map();
  private cursorThrottle = 0;
  private readonly CURSOR_THROTTLE_MS = 50; // 20 FPS for cursor updates

  connect(
    projectId: string,
    userId: string,
    userName: string,
    userColor: string = '#1976d2'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        this.socket = io(serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        this.currentProjectId = projectId;
        this.currentUserId = userId;
        this.currentUserName = userName;
        this.currentUserColor = userColor;

        // Connection events
        this.socket.on('connect', () => {
          console.log('Connected to realtime server');
          this.emit('user_joined', {
            projectId,
            userId,
            userName,
            userColor
          });
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from realtime server');
          this.emit('user_disconnected', { userId });
        });

        // Listen for events
        this.socket.on('user_joined', (data) => this.handleUserJoined(data));
        this.socket.on('canvas_updated', (data) => this.handleCanvasUpdate(data));
        this.socket.on('cursor_moved', (data) => this.handleCursorMove(data));
        this.socket.on('item_locked', (data) => this.handleItemLocked(data));
        this.socket.on('item_released', (data) => this.handleItemReleased(data));
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentProjectId = null;
    }
  }

  broadcastCanvasUpdate(
    itemId: string,
    position?: { x: number; y: number },
    size?: { width: number; height: number }
  ): void {
    if (!this.socket || !this.currentProjectId || !this.currentUserId) return;

    this.socket.emit('canvas_update', {
      projectId: this.currentProjectId,
      userId: this.currentUserId,
      itemId,
      position,
      size,
      timestamp: new Date().toISOString()
    });
  }

  broadcastCursorPosition(x: number, y: number): void {
    if (!this.socket || !this.currentProjectId || !this.currentUserId) return;

    // Throttle cursor updates to 20 FPS
    const now = Date.now();
    if (now - this.cursorThrottle < this.CURSOR_THROTTLE_MS) {
      return;
    }
    this.cursorThrottle = now;

    this.socket.emit('cursor_move', {
      projectId: this.currentProjectId,
      userId: this.currentUserId,
      userName: this.currentUserName,
      userColor: this.currentUserColor,
      position: { x, y },
      timestamp: new Date().toISOString()
    });
  }

  lockItem(itemId: string): void {
    if (!this.socket || !this.currentProjectId || !this.currentUserId) return;

    this.socket.emit('item_locked', {
      projectId: this.currentProjectId,
      userId: this.currentUserId,
      itemId,
      userName: this.currentUserName,
      userColor: this.currentUserColor
    });
  }

  releaseItem(itemId: string): void {
    if (!this.socket || !this.currentProjectId || !this.currentUserId) return;

    this.socket.emit('item_released', {
      projectId: this.currentProjectId,
      userId: this.currentUserId,
      itemId
    });
  }

  // Event listeners
  subscribe(event: string, listener: RealtimeListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  unsubscribe(event: string, listener: RealtimeListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  private handleUserJoined(data: any): void {
    this.emit('user_joined', data);
  }

  private handleCanvasUpdate(data: any): void {
    this.emit('canvas_updated', data);
  }

  private handleCursorMove(data: any): void {
    this.emit('cursor_moved', data);
  }

  private handleItemLocked(data: any): void {
    this.emit('item_locked', data);
  }

  private handleItemReleased(data: any): void {
    this.emit('item_released', data);
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
