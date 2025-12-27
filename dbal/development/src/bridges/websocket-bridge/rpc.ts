import { DBALError } from '../../core/foundation/errors'
import { generateRequestId } from '../utils/generate-request-id'
import type { RPCMessage } from '../utils/rpc-types'
import { connect } from './connection'
import type { BridgeState } from './state'

export const rpcCall = async (state: BridgeState, method: string, ...params: unknown[]): Promise<unknown> => {
  await connect(state)

  const id = generateRequestId()
  const message: RPCMessage = { id, method, params }

  return new Promise((resolve, reject) => {
    state.pendingRequests.set(id, { resolve, reject })

    if (state.ws?.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify(message))
    } else {
      state.pendingRequests.delete(id)
      reject(DBALError.internal('WebSocket connection not open'))
      return
    }

    setTimeout(() => {
      if (state.pendingRequests.has(id)) {
        state.pendingRequests.delete(id)
        reject(DBALError.timeout('Request timed out'))
      }
    }, 30000)
  })
}
