/**
 * DBAL configuration — API URL, tenant, entity mapping, helpers.
 */

export const DBAL_API_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL || 'http://localhost:8080'
export const DBAL_TENANT =
  process.env.NEXT_PUBLIC_DBAL_TENANT || 'default'
/** Admin token — not NEXT_PUBLIC_ to avoid client-side exposure. */
export const DBAL_ADMIN_TOKEN =
  process.env.DBAL_ADMIN_TOKEN || ''

/** Redux slice name → DBAL entity/package mapping */
export const ENTITY_MAP: Record<
  string,
  { entity: string; package: string }
> = {
  files: { entity: 'ProjectFile', package: 'codeforge' },
  models: { entity: 'ProjectModel', package: 'codeforge' },
  components: { entity: 'ComponentNode', package: 'codeforge' },
  componentTrees: { entity: 'ComponentTree', package: 'codeforge' },
  workflows: { entity: 'Workflow', package: 'core' },
  lambdas: { entity: 'Lambda', package: 'codeforge' },
  project: { entity: 'Project', package: 'codeforge' },
  projects: { entity: 'Project', package: 'codeforge' },
  settings: { entity: 'Settings', package: 'codeforge' },
  theme: { entity: 'Theme', package: 'codeforge' },
  kv: { entity: 'KVEntry', package: 'codeforge' },
  translations: { entity: 'Translation', package: 'core' },
}

export function isConnectionError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    (error.message === 'Failed to fetch' ||
      error.message === 'Load failed' ||
      error.message.startsWith('NetworkError'))
  )
}

export function entityUrl(sliceName: string, id?: string): string {
  const mapping = ENTITY_MAP[sliceName]
  if (!mapping) {
    throw new Error(`[DBALSync] Unknown slice: ${sliceName}`)
  }
  const base =
    `${DBAL_API_URL}/${DBAL_TENANT}/` +
    `${mapping.package}/${mapping.entity}`
  return id ? `${base}/${id}` : base
}

export function adminUrl(path: string): string {
  return `${DBAL_API_URL}/admin/${path}`
}

export function adminHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (DBAL_ADMIN_TOKEN) {
    headers['Authorization'] = `Bearer ${DBAL_ADMIN_TOKEN}`
  }
  return headers
}
