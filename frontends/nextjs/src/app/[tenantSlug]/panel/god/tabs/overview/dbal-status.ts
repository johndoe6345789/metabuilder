/** Whether the data layer is answering, and which build it is. */

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
const TIMEOUT_MS = 3000

export type DbalState = 'checking' | 'online' | 'offline'

export interface DbalStatus {
  state: DbalState
  version?: string
}

async function ask(path: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${DBAL_URL}${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    return res.ok ? ((await res.json()) as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** True when /health answers at all. */
export async function isDbalOnline(): Promise<boolean> {
  return (await ask('/health')) !== null
}

/** The daemon exposes its version at /version, not at /health. */
export async function readDbalVersion(): Promise<string | undefined> {
  const body = await ask('/version')
  return typeof body?.version === 'string' ? body.version : undefined
}

/**
 * Both answers together. The version is optional: a daemon that is up but
 * will not name itself is still up, and the card says so.
 */
export async function readDbalStatus(): Promise<DbalStatus> {
  const [online, version] = await Promise.all([
    isDbalOnline(),
    readDbalVersion(),
  ])
  return { state: online ? 'online' : 'offline', version }
}

export { DBAL_URL }
