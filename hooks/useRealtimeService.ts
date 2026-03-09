/**
 * useRealtimeService Hook
 * Initializes and manages WebSocket connection for real-time collaboration
 *
 * Migrated from workflowui - requires Redux store and realtime service
 *
 * Features:
 * - WebSocket connection initialization with JWT authentication
 * - Real-time user presence tracking and cursor positions
 * - Collaborative item locking/unlocking during editing
 * - Live canvas update broadcasting
 * - Automatic reconnection with exponential backoff
 */

import { useEffect, useCallback, useRef } from 'react';

/** Connected user interface */
export interface ConnectedUser {
  userId: string;
  userName: string;
  userColor: string;
  cursorPosition?: { x: number; y: number };
}

/** Current user interface */
export interface CurrentUser {
  id: string;
  name: string;
}

/** Realtime service interface */
export interface RealtimeService {
  connect: (projectId: string, userId: string, userName: string, userColor: string) => void;
  disconnect: () => void;
  subscribe: (event: string, callback: (data: any) => void) => void;
  broadcastCanvasUpdate: (itemId: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  broadcastCursorPosition: (x: number, y: number) => void;
  lockItem: (itemId: string) => void;
  releaseItem: (itemId: string) => void;
}

/** Redux actions interface */
export interface RealtimeActions {
  setConnected: (connected: boolean) => any;
  addConnectedUser: (user: ConnectedUser) => any;
  removeConnectedUser: (userId: string) => any;
  updateRemoteCursor: (data: { userId: string; position: { x: number; y: number } }) => any;
  lockItem: (data: { itemId: string; userId: string }) => any;
  releaseItem: (itemId: string) => any;
}

export interface UseRealtimeServiceOptions {
  projectId: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
  /** Redux dispatch function */
  dispatch: (action: any) => void;
  /** Current user from Redux state */
  user: CurrentUser | null;
  /** Connected users from Redux state */
  connectedUsers: ConnectedUser[];
  /** Realtime service instance */
  realtimeService: RealtimeService;
  /** Redux action creators */
  actions: RealtimeActions;
}

/**
 * Hook to manage realtime service connection
 * Automatically connects on mount and disconnects on unmount
 */
export function useRealtimeService(options: UseRealtimeServiceOptions) {
  const {
    projectId,
    enabled = true,
    onError,
    dispatch,
    user,
    connectedUsers,
    realtimeService,
    actions
  } = options;

  const connectionRef = useRef<RealtimeService | null>(null);

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
        dispatch(actions.setConnected(true));
      });

      realtimeService.subscribe('disconnected', () => {
        dispatch(actions.setConnected(false));
      });

      realtimeService.subscribe('user_joined', (data: any) => {
        dispatch(
          actions.addConnectedUser({
            userId: data.userId,
            userName: data.userName,
            userColor: data.userColor || '#999',
            cursorPosition: undefined
          })
        );
      });

      realtimeService.subscribe('user_left', (data: any) => {
        dispatch(actions.removeConnectedUser(data.userId));
      });

      realtimeService.subscribe('cursor_moved', (data: any) => {
        dispatch(
          actions.updateRemoteCursor({
            userId: data.userId,
            position: data.position
          })
        );
      });

      realtimeService.subscribe('item_locked', (data: any) => {
        dispatch(
          actions.lockItem({
            itemId: data.itemId,
            userId: data.userId
          })
        );
      });

      realtimeService.subscribe('item_released', (data: any) => {
        dispatch(actions.releaseItem(data.itemId));
      });

      return () => {
        // Disconnect on unmount
        realtimeService.disconnect();
        dispatch(actions.setConnected(false));
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to initialize realtime service:', err);
      onError?.(err);
    }
  }, [projectId, user, enabled, dispatch, onError, realtimeService, actions]);

  // Broadcast canvas item updates
  const broadcastCanvasUpdate = useCallback(
    (itemId: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
      if (connectionRef.current) {
        realtimeService.broadcastCanvasUpdate(itemId, position, size);
      }
    },
    [realtimeService]
  );

  // Broadcast cursor position
  const broadcastCursorPosition = useCallback((x: number, y: number) => {
    if (connectionRef.current) {
      realtimeService.broadcastCursorPosition(x, y);
    }
  }, [realtimeService]);

  // Lock item during editing
  const lockCanvasItem = useCallback((itemId: string) => {
    if (connectionRef.current && user) {
      realtimeService.lockItem(itemId);
      dispatch(
        actions.lockItem({
          itemId,
          userId: user.id
        })
      );
    }
  }, [dispatch, user, realtimeService, actions]);

  // Release item after editing
  const releaseCanvasItem = useCallback((itemId: string) => {
    if (connectionRef.current) {
      realtimeService.releaseItem(itemId);
      dispatch(actions.releaseItem(itemId));
    }
  }, [dispatch, realtimeService, actions]);

  return {
    isConnected: connectionRef.current !== null,
    connectedUsers,
    broadcastCanvasUpdate,
    broadcastCursorPosition,
    lockCanvasItem,
    releaseCanvasItem
  };
}

export default useRealtimeService;
