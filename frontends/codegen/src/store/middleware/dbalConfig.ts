/**
 * DBAL configuration — API URL, tenant, entity mapping, helpers.
 */

export const DBAL_API_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL || 'http://localhost:8080'
export const DBAL_TENANT =
  process.env.NEXT_PUBLIC_DBAL_TENANT || 'default'

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

