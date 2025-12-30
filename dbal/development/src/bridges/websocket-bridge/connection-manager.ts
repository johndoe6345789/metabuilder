import { DBALError } from '../../core/foundation/errors'
import type { RPCMessage } from '../utils/rpc-types'
import type { BridgeState } from './state'
import type { MessageRouter } from './message-router'

export interface ConnectionManager {
  ensureConnection: () => Promise<void>
  send: (message: RPCMessage) => Promise<void>
  close: () => Promise<void>
}

export const createConnectionManager = (
  state: BridgeState,
  messageRouter: MessageRouter,
): ConnectionManager => {
  let connectionPromise: Promise<void> | null = null

  const resetConnection = () => {
    connectionPromise = null
    state.ws = null
  }

  const rejectPendingRequests = (error: DBALError) => {
    state.pendingRequests.forEach(({ reject }) => reject(error))
    state.pendingRequests.clear()
  }

  const ensureConnection = async (): Promise<void> => {
    if (state.ws?.readyState === WebSocket.OPEN) {
      return
    }

    if (connectionPromise) {
      return connectionPromise
    }

    connectionPromise = new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(state.endpoint)
        state.ws = ws

        ws.onopen = () => resolve()
        ws.onerror = error => {
          const connectionError = DBALError.internal(`WebSocket connection failed: ${error}`)
          rejectPendingRequests(connectionError)
          resetConnection()
          reject(connectionError)
        }
        ws.onclose = () => {
          rejectPendingRequests(DBALError.internal('WebSocket connection closed'))
          resetConnection()
        }
        ws.onmessage = event => messageRouter.handle(event.data)
      } catch (error) {
        resetConnection()
        const connectionError =
          error instanceof DBALError ? error : DBALError.internal('Failed to establish WebSocket connection')
        reject(connectionError)
      }
    })

    return connectionPromise
  }

  const send = async (message: RPCMessage): Promise<void> => {
    await ensureConnection()

    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
      throw DBALError.internal('WebSocket connection not open')
    }

    state.ws.send(JSON.stringify(message))
  }

  const close = async (): Promise<void> => {
    rejectPendingRequests(DBALError.internal('WebSocket connection closed'))

    if (state.ws) {
      state.ws.close()
    }

    resetConnection()
  }

  return {
    ensureConnection,
    send,
    close,
  }
}
