import type { RPCResponse } from '../utils/rpc-types'
import type { BridgeState } from './state'
import { DBALError } from '../../core/foundation/errors'

export const handleMessage = (state: BridgeState, data: string): void => {
  try {
    const response: RPCResponse = JSON.parse(data)
    const pending = state.pendingRequests.get(response.id)

    if (!pending) {
      return
    }

    state.pendingRequests.delete(response.id)

    if (response.error) {
      const error = new DBALError(response.error.message, response.error.code, response.error.details)
      pending.reject(error)
    } else {
      pending.resolve(response.result)
    }
  } catch (error) {
    console.error('Failed to parse WebSocket message:', error)
  }
}
