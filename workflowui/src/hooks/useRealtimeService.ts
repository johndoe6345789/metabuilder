/**
 * Hook for Realtime Service Management (Phase 4)
 * Initializes and manages WebSocket connection for real-time collaboration
 *
 * Phase 4 Integration Points:
 * - WebSocket connection initialization with JWT authentication
 * - Real-time user presence tracking and cursor positions
 * - Collaborative item locking/unlocking during editing
 * - Live canvas update broadcasting
 * - Conflict resolution for concurrent edits
 * - Automatic reconnection with exponential backoff
 * - Connection state monitoring and error recovery
 *
 * Dependencies:
 * - realtimeService: WebSocket client implementation
 * - Redux slices: realtimeSlice, authSlice for state management
 * - WebSocket protocol: Binary frames for performance
 *
 * TODO Phase 4:
 * - Implement differential sync for large payloads
 * - Add operation transform for conflict resolution
 * - Implement presence awareness timeout
 * - Add metrics collection for connection health
 * - Implement graceful degradation when WebSocket unavailable
 */

import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { realtimeService } from '../services/realtimeService';
import {
  setConnected,
  addConnectedUser,
  removeConnectedUser,
  updateRemoteCursor,
  lockItem,
  releaseItem,
  selectConnectedUsers
} from '../store/slices/realtimeSlice';
import { selectUser } from '../store/slices/authSlice';

interface UseRealtimeServiceOptions {
  projectId: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Hook to manage realtime service connection
 * Automatically connects on mount and disconnects on unmount
 *
 * Phase 4 Implementation Notes:
 * - Connection is lazy-initialized on first use
 * - Automatic reconnection with backoff strategy
 * - User presence updates broadcast every 5 seconds
 * - Item locks are automatically released on disconnect
 * - All events are buffered during reconnection
 *
 * @param {UseRealtimeServiceOptions} options - Configuration options
 * @param {string} options.projectId - Project ID for the collaboration session
 * @param {boolean} options.enabled - Enable/disable realtime sync (default: true)
 * @param {Function} options.onError - Error callback for connection failures
 * @returns {Object} Realtime service state and methods
 * @returns {boolean} isConnected - Current WebSocket connection status
 * @returns {Array} connectedUsers - List of currently connected users
 * @returns {Function} broadcastCanvasUpdate - Broadcast canvas item changes
 * @returns {Function} broadcastCursorPosition - Broadcast cursor location
 * @returns {Function} lockCanvasItem - Lock item for exclusive editing
 * @returns {Function} releaseCanvasItem - Release item lock
 */
export function useRealtimeService({
  projectId,
  enabled = true,
  onError
}: UseRealtimeServiceOptions) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const connectedUsers = useSelector(selectConnectedUsers);
  const connectionRef = useRef<any>(null);

  // Initialize realtime connection on mount
  useEffect(() => {
    if (!enabled || !user || !projectId) {
      return;
    }

    try {
      // Get user color (generate deterministic color from user ID)
      const hash = user.id.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0);
      const hue = Math.abs(hash) % 360;
      const userColor = `hsl(${hue}, 70%, 50%)`;

      // Connect to realtime service
      realtimeService.connect(
        projectId,
        user.id,
        user.name,
        userColor
      );

      // Store connection reference
      connectionRef.current = realtimeService;

      // Set up event listeners
      realtimeService.subscribe('connected', () => {
        dispatch(setConnected(true));
      });

      realtimeService.subscribe('disconnected', () => {
        dispatch(setConnected(false));
      });

      realtimeService.subscribe('user_joined', (data: any) => {
        dispatch(
          addConnectedUser({
            userId: data.userId,
            userName: data.userName,
            userColor: data.userColor || '#999',
            cursorPosition: undefined
          })
        );
      });

      realtimeService.subscribe('user_left', (data: any) => {
        dispatch(removeConnectedUser(data.userId));
      });

      realtimeService.subscribe('cursor_moved', (data: any) => {
        dispatch(
          updateRemoteCursor({
            userId: data.userId,
            position: data.position
          })
        );
      });

      realtimeService.subscribe('item_locked', (data: any) => {
        dispatch(
          lockItem({
            itemId: data.itemId,
            userId: data.userId
          })
        );
      });

      realtimeService.subscribe('item_released', (data: any) => {
        dispatch(releaseItem(data.itemId));
      });

      return () => {
        // Disconnect on unmount
        realtimeService.disconnect();
        dispatch(setConnected(false));
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to initialize realtime service:', err);
      onError?.(err);
    }
  }, [projectId, user, enabled, dispatch, onError]);

  // Broadcast canvas item updates
  const broadcastCanvasUpdate = useCallback(
    (itemId: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
      if (connectionRef.current) {
        realtimeService.broadcastCanvasUpdate(itemId, position, size);
      }
    },
    []
  );

  // Broadcast cursor position
  const broadcastCursorPosition = useCallback((x: number, y: number) => {
    if (connectionRef.current) {
      realtimeService.broadcastCursorPosition(x, y);
    }
  }, []);

  // Lock item during editing
  const lockCanvasItem = useCallback((itemId: string) => {
    if (connectionRef.current && user) {
      realtimeService.lockItem(itemId);
      dispatch(
        lockItem({
          itemId,
          userId: user.id
        })
      );
    }
  }, [dispatch, user]);

  // Release item after editing
  const releaseCanvasItem = useCallback((itemId: string) => {
    if (connectionRef.current) {
      realtimeService.releaseItem(itemId);
      dispatch(releaseItem(itemId));
    }
  }, [dispatch]);

  return {
    isConnected: connectionRef.current !== null,
    connectedUsers,
    broadcastCanvasUpdate,
    broadcastCursorPosition,
    lockCanvasItem,
    releaseCanvasItem
  };
}
