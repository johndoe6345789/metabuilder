/**
 * @file rpc-types.ts
 * @description Type definitions for RPC messaging
 */

export interface RPCMessage {
  id: string
  method: string
  params: unknown[]
}

export interface RPCResponse {
  id: string
  result?: unknown
  error?: {
    code: number
    message: string
    details?: Record<string, unknown>
  }
}

export interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}
