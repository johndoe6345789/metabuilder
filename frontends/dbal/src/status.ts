export type StatusLevel = 'online' | 'degraded' | 'offline'

export interface ServerHealth {
  name: string
  status: StatusLevel
  message: string
  latencyMs?: number
}

const baseStatuses: ServerHealth[] = [
  {
    name: 'DBAL TypeScript Client',
    status: 'online',
    message: 'Handling CLI and server workflows via Prisma.',
    latencyMs: 14,
  },
  {
    name: 'Prisma ORM',
    status: 'online',
    message: 'Schema validated & migrations ready (Postgres/MySQL).',
    latencyMs: 32,
  },
  {
    name: 'C++ DBAL Daemon (Phase 3)',
    status: 'degraded',
    message: 'Running the in-memory prototype while SQL adapters mature.',
    latencyMs: 48,
  },
  {
    name: 'Server Side Metrics',
    status: 'online',
    message: 'Audit logs streaming successfully and metrics exported.',
    latencyMs: 5,
  },
]

export interface StatusResponse {
  updatedAt: string
  statuses: ServerHealth[]
}

export function getStatusResponse(): StatusResponse {
  return {
    updatedAt: new Date().toISOString(),
    statuses: baseStatuses,
  }
}
