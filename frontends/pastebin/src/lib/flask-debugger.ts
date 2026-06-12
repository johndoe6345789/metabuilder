import { getAuthToken } from '@/lib/authToken'

function base(): string {
  const url = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL?.replace(/\/$/, '')
  if (!url) throw new Error('Flask backend not configured')
  return url
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface DapMessage {
  seq: number
  type: 'request' | 'response' | 'event'
  [key: string]: unknown
}

export interface StartDebugResult {
  session_id: string
  launch_args: Record<string, unknown>
}

export interface PollDebugResult {
  messages: DapMessage[]
  done: boolean
}

export async function startDebugSession(opts: {
  language: string
  files: { name: string; content: string }[]
  entryPoint?: string
}): Promise<StartDebugResult> {
  const res = await fetch(`${base()}/api/debug`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(opts),
    // Large timeout: container + adapter startup can take 30–60s
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function pollDebugSession(
  sessionId: string,
  offset: number,
): Promise<PollDebugResult> {
  const res = await fetch(
    `${base()}/api/debug/${sessionId}/poll?offset=${offset}`,
    { headers: authHeaders(), signal: AbortSignal.timeout(5000) },
  )
  if (!res.ok) throw new Error(`Poll failed: ${res.statusText}`)
  return res.json()
}

export async function sendDapMessage(
  sessionId: string,
  msg: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${base()}/api/debug/${sessionId}/dap`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(msg),
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Send DAP failed: ${res.statusText}`)
  }
}

export async function stopDebugSession(sessionId: string): Promise<void> {
  await fetch(`${base()}/api/debug/${sessionId}`, {
    method: 'DELETE',
    headers: authHeaders(),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {})
}

export function isDebuggerAvailable(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FLASK_BACKEND_URL)
}
