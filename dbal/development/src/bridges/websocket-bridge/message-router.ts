import { DBALError } from '../../core/foundation/errors'
import type { RPCResponse } from '../utils/rpc-types'
import type { BridgeState } from './state'

export interface MessageRouter {
  handle: (rawMessage: unknown) => void
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isRPCError = (value: unknown): value is NonNullable<RPCResponse['error']> =>
  isRecord(value) &&
  typeof value.code === 'number' &&
  typeof value.message === 'string' &&
  (value.details === undefined || isRecord(value.details))

const isRPCResponse = (value: unknown): value is RPCResponse => {
  if (!isRecord(value)) {
    return false
  }

  const hasId = typeof value.id === 'string'
  const hasResult = Object.prototype.hasOwnProperty.call(value, 'result')
  const hasError = isRPCError(value.error) || value.error === undefined

  return hasId && (hasResult || isRPCError(value.error)) && hasError
}

const parseResponse = (rawMessage: string): RPCResponse => {
  const parsed = JSON.parse(rawMessage) as unknown

  if (!isRPCResponse(parsed)) {
    throw new Error('Invalid RPC response shape')
  }

  return parsed
}

export const createMessageRouter = (state: BridgeState): MessageRouter => ({
  handle: (rawMessage: unknown) => {
    if (typeof rawMessage !== 'string') {
      console.warn('Ignoring non-string WebSocket message')
      return
    }

    try {
      const response = parseResponse(rawMessage)
      const pending = state.pendingRequests.get(response.id)

      if (!pending) {
        console.warn(`No pending request for response ${response.id}`)
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
      console.error('Failed to process WebSocket message', error)
    }
  },
})
