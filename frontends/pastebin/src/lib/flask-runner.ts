import { type SnippetFile } from '@/lib/types'
import { getAuthToken } from '@/lib/authToken'

export interface RunResult {
  output: string
  error: string | null
}

/** @deprecated Use RunResult */
export type PythonRunResult = RunResult

export interface SessionOutputLine {
  type: 'out' | 'err' | 'prompt' | 'input-echo'
  text: string
}

export interface PollResult {
  output: SessionOutputLine[]
  waiting_for_input: boolean
  done: boolean
}

export interface RunOptions {
  language: string
  files: SnippetFile[]
  entryPoint?: string
}

function getFlaskBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_FLASK_BACKEND_URL?.replace(/\/$/, '') ?? null
}

function requireUrl(): string {
  const url = getFlaskBaseUrl()
  if (!url) throw new Error('Flask backend not configured (NEXT_PUBLIC_FLASK_BACKEND_URL is not set)')
  return url
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ---------------------------------------------------------------------------
// Non-interactive run
// ---------------------------------------------------------------------------

export async function runCodeViaFlask(opts: RunOptions): Promise<RunResult> {
  const base = requireUrl()
  const response = await fetch(`${base}/api/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      language: opts.language,
      files: opts.files,
      entryPoint: opts.entryPoint,
    }),
    signal: AbortSignal.timeout(130000),
  })

  if (!response.ok && response.status !== 408) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `Server error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    output: data.output ?? '',
    error: data.error ?? null,
  }
}

/** @deprecated Use runCodeViaFlask */
export async function runPythonViaFlask(code: string): Promise<RunResult> {
  return runCodeViaFlask({ language: 'python', files: [{ name: 'main.py', content: code }] })
}

// ---------------------------------------------------------------------------
// Interactive session
// ---------------------------------------------------------------------------

export async function startInteractiveSession(opts: RunOptions): Promise<string> {
  const base = requireUrl()
  const response = await fetch(`${base}/api/run/interactive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      language: opts.language,
      files: opts.files,
      entryPoint: opts.entryPoint,
    }),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to start session: ${response.statusText}`)
  }
  const data = await response.json()
  return data.session_id as string
}

export async function pollSession(sessionId: string, offset: number): Promise<PollResult> {
  const base = requireUrl()
  const response = await fetch(
    `${base}/api/run/interactive/${sessionId}/poll?offset=${offset}`,
    { headers: authHeaders(), signal: AbortSignal.timeout(5000) }
  )
  if (!response.ok) throw new Error(`Poll failed: ${response.statusText}`)
  return response.json()
}

export async function sendSessionInput(sessionId: string, value: string): Promise<void> {
  const base = requireUrl()
  const response = await fetch(`${base}/api/run/interactive/${sessionId}/input`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ value }),
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) throw new Error(`Send input failed: ${response.statusText}`)
}

export function isFlaskRunnerAvailable(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FLASK_BACKEND_URL)
}
