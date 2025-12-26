import { NextResponse } from 'next/server'

const baseStatuses = [
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

export function GET() {
  const payload = {
    updatedAt: new Date().toISOString(),
    statuses: baseStatuses.map(item => ({
      ...item,
      status: item.status,
      message: item.message,
      latencyMs: item.latencyMs,
    })),
  }

  return NextResponse.json(payload)
}
