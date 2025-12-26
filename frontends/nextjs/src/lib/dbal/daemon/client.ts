const DEFAULT_DAEMON_URL = process.env.DBAL_DAEMON_URL || 'http://localhost:8080/api/dbal'

export type DaemonEntity = 'User'
export type DaemonAction = 'list' | 'get' | 'read' | 'create' | 'update' | 'delete'

export interface DaemonRpcRequest {
  entity: DaemonEntity
  action: DaemonAction
  payload?: Record<string, unknown>
  options?: Record<string, unknown>
}

export async function callDaemon<T = unknown>(request: DaemonRpcRequest): Promise<T> {
  const response = await fetch(DEFAULT_DAEMON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  let body: { success?: boolean; message?: string; data?: T }
  try {
    body = (await response.json()) as typeof body
  } catch (error) {
    throw new Error('Failed to parse response from DBAL daemon')
  }

  if (!response.ok) {
    throw new Error(body?.message || 'DBAL daemon request failed')
  }

  if (body?.success === false) {
    throw new Error(body.message || 'DBAL daemon reported failure')
  }

  return body?.data as T
}
