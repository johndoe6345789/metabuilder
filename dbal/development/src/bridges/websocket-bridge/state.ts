import type { PendingRequest } from '../utils/rpc-types'

export interface BridgeState {
  ws: WebSocket | null
  endpoint: string
  auth?: { user: unknown; session: unknown }
  pendingRequests: Map<string, PendingRequest>
}

export const createBridgeState = (
  endpoint: string,
  auth?: { user: unknown; session: unknown },
): BridgeState => ({
  ws: null,
  endpoint,
  auth,
  pendingRequests: new Map<string, PendingRequest>(),
})
