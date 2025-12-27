import { DBALError } from '../../core/foundation/errors'
import { handleMessage } from './message-handler'
import type { BridgeState } from './state'

export const connect = async (state: BridgeState): Promise<void> => {
  if (state.ws?.readyState === WebSocket.OPEN) {
    return
  }

  return new Promise((resolve, reject) => {
    state.ws = new WebSocket(state.endpoint)

    state.ws.onopen = () => resolve()
    state.ws.onerror = error => reject(DBALError.internal(`WebSocket connection failed: ${error}`))
    state.ws.onmessage = event => handleMessage(state, event.data)
    state.ws.onclose = () => {
      state.ws = null
    }
  })
}

export const closeConnection = async (state: BridgeState): Promise<void> => {
  if (state.ws) {
    state.ws.close()
    state.ws = null
  }
  state.pendingRequests.clear()
}
