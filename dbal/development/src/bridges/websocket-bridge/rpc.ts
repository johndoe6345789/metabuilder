import { DBALError } from '@/core/foundation/errors'
import { generateRequestId } from '../utils/generate-request-id'
import type { RPCMessage } from '../utils/rpc-types'
import type { ConnectionManager } from './connection-manager'
import type { BridgeState } from './state'

export const rpcCall = async (
  state: BridgeState,
  connectionManager: ConnectionManager,
  method: string,
  ...params: unknown[]
): Promise<unknown> => {
  const id = generateRequestId()
  const message: RPCMessage = { id, method, params }

  return new Promise((resolve, reject) => {
    state.pendingRequests.set(id, { resolve, reject })

    connectionManager
      .send(message)
      .catch(error => {
        state.pendingRequests.delete(id)
        reject(error)
        return
      })

    setTimeout(() => {
      if (state.pendingRequests.has(id)) {
        state.pendingRequests.delete(id)
        reject(DBALError.timeout('Request timed out'))
      }
    }, 30000)
  })
}
