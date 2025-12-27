/**
 * @file websocket-bridge.ts
 * @description WebSocket bridge adapter for remote DBAL daemon
 */

import type { DBALAdapter, AdapterCapabilities } from '../adapters/adapter'
import type { ListOptions, ListResult } from '../core/types'
import { DBALError } from '../core/foundation/errors'
import { generateRequestId } from './utils/generate-request-id'
import type { RPCMessage, RPCResponse, PendingRequest } from './utils/rpc-types'

export class WebSocketBridge implements DBALAdapter {
  private ws: WebSocket | null = null
  private endpoint: string
  private auth?: { user: unknown, session: unknown }
  private pendingRequests = new Map<string, PendingRequest>()

  constructor(endpoint: string, auth?: { user: unknown, session: unknown }) {
    this.endpoint = endpoint
    this.auth = auth
  }

  private async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.endpoint)

      this.ws.onopen = () => {
        resolve()
      }

      this.ws.onerror = (error) => {
        reject(DBALError.internal(`WebSocket connection failed: ${error}`))
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onclose = () => {
        this.ws = null
      }
    })
  }

  private handleMessage(data: string): void {
    try {
      const response: RPCResponse = JSON.parse(data)
      const pending = this.pendingRequests.get(response.id)

      if (!pending) {
        return
      }

      this.pendingRequests.delete(response.id)

      if (response.error) {
        const error = new DBALError(
          response.error.message,
          response.error.code,
          response.error.details
        )
        pending.reject(error)
      } else {
        pending.resolve(response.result)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private async call(method: string, ...params: unknown[]): Promise<unknown> {
    await this.connect()

    const id = generateRequestId()
    const message: RPCMessage = { id, method, params }

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message))
      } else {
        this.pendingRequests.delete(id)
        reject(DBALError.internal('WebSocket connection not open'))
      }

      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(DBALError.timeout('Request timed out'))
        }
      }, 30000)
    })
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    return this.call('create', entity, data)
  }

  async read(entity: string, id: string): Promise<unknown | null> {
    return this.call('read', entity, id)
  }

  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.call('update', entity, id, data)
  }

  async delete(entity: string, id: string): Promise<boolean> {
    return this.call('delete', entity, id) as Promise<boolean>
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    return this.call('list', entity, options) as Promise<ListResult<unknown>>
  }

  async findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    return this.call('findFirst', entity, filter)
  }

  async findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    return this.call('findByField', entity, field, value)
  }

  async upsert(
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown> {
    return this.call('upsert', entity, filter, createData, updateData)
  }

  async updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown> {
    return this.call('updateByField', entity, field, value, data)
  }

  async deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    return this.call('deleteByField', entity, field, value) as Promise<boolean>
  }

  async deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    return this.call('deleteMany', entity, filter) as Promise<number>
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    return this.call('createMany', entity, data) as Promise<number>
  }

  async updateMany(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<number> {
    return this.call('updateMany', entity, filter, data) as Promise<number>
  }

  async getCapabilities(): Promise<AdapterCapabilities> {
    return this.call('getCapabilities') as Promise<AdapterCapabilities>
  }

  async close(): Promise<void> {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.pendingRequests.clear()
  }
}
