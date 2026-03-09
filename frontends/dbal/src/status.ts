export type StatusLevel = 'online' | 'degraded' | 'offline'

export interface ServerHealth {
  name: string
  status: StatusLevel
  message: string
  latencyMs?: number
}

export interface StatusResponse {
  updatedAt: string
  statuses: ServerHealth[]
}

const DBAL_DAEMON_URL = process.env.DBAL_DAEMON_URL ?? 'http://localhost:8080'

export async function getStatusResponse(): Promise<StatusResponse> {
  const statuses: ServerHealth[] = []
  const start = Date.now()

  try {
    const response = await fetch(`${DBAL_DAEMON_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    })
    const latency = Date.now() - start

    if (response.ok) {
      const data = await response.json()
      statuses.push({
        name: 'DBAL Daemon',
        status: 'online',
        message: `Version ${data.version ?? 'unknown'}, uptime ${data.uptime ?? 'n/a'}`,
        latencyMs: latency,
      })

      if (data.adapters && Array.isArray(data.adapters)) {
        for (const adapter of data.adapters) {
          statuses.push({
            name: adapter.name ?? adapter.type,
            status: adapter.connected ? 'online' : 'offline',
            message: adapter.connected
              ? `Connected (${adapter.type})`
              : `Disconnected: ${adapter.error ?? 'unknown'}`,
            latencyMs: adapter.latencyMs,
          })
        }
      }
    } else {
      statuses.push({
        name: 'DBAL Daemon',
        status: 'degraded',
        message: `Health check returned ${response.status}`,
        latencyMs: latency,
      })
    }
  } catch (err) {
    statuses.push({
      name: 'DBAL Daemon',
      status: 'offline',
      message: err instanceof Error ? err.message : 'Unable to reach daemon',
    })
  }

  return {
    updatedAt: new Date().toISOString(),
    statuses,
  }
}
