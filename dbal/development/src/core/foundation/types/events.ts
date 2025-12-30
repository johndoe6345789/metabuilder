import type { OperationContext } from './operations'

export interface DomainEvent<TPayload = Record<string, unknown>> {
  id: string
  name: string
  occurredAt: Date
  payload: TPayload
  context?: OperationContext
}

export interface EventHandler<TPayload = Record<string, unknown>> {
  (event: DomainEvent<TPayload>): void | Promise<void>
}
