/** Turning the GET query string into a DBAL filter and page window. */

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100
const DEFAULT_OFFSET = 0

export interface WorkflowListQuery {
  filter: Record<string, unknown>
  limit: number
  offset: number
}

/** NaN or a negative number both mean "not a real value here". */
function positiveInt(raw: string | null, fallback: number): number {
  const parsed = raw === null ? NaN : parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export function parseWorkflowListQuery(
  searchParams: URLSearchParams,
  tenant: string
): WorkflowListQuery {
  const limit = Math.min(
    positiveInt(searchParams.get('limit'), DEFAULT_LIMIT),
    MAX_LIMIT
  )
  const offset = positiveInt(searchParams.get('offset'), DEFAULT_OFFSET)

  const filter: Record<string, unknown> = { tenantId: tenant }

  const category = searchParams.get('category')
  if (category !== null) filter.category = category

  const tags = searchParams.get('tags')
  if (tags !== null && tags.trim() !== '') {
    filter.tags = { $in: tags.split(',').map(t => t.trim()) }
  }

  const active = searchParams.get('active')
  if (active !== null) filter.active = active === 'true'

  return { filter, limit, offset }
}
