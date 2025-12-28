export type WorkflowRunLike = {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  head_branch: string
  event: string
}

const FALLBACK_NAME = 'Unknown workflow'
const FALLBACK_STATUS = 'unknown'
const FALLBACK_BRANCH = 'unknown'
const FALLBACK_EVENT = 'unknown'

function toStringOrFallback(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback
}

export function parseWorkflowRuns(runs: unknown[]): WorkflowRunLike[] {
  if (!Array.isArray(runs)) {
    return []
  }

  return runs
    .map((run) => {
      const candidate = run as Partial<WorkflowRunLike> & { id?: unknown }
      const id = Number(candidate.id)

      if (!Number.isFinite(id)) {
        return null
      }

      return {
        id,
        name: toStringOrFallback(candidate.name, FALLBACK_NAME),
        status: toStringOrFallback(candidate.status, FALLBACK_STATUS),
        conclusion:
          candidate.conclusion === null || typeof candidate.conclusion === 'string'
            ? candidate.conclusion
            : null,
        created_at: toStringOrFallback(candidate.created_at, ''),
        updated_at: toStringOrFallback(candidate.updated_at, ''),
        head_branch: toStringOrFallback(candidate.head_branch, FALLBACK_BRANCH),
        event: toStringOrFallback(candidate.event, FALLBACK_EVENT),
      }
    })
    .filter((run): run is WorkflowRunLike => Boolean(run))
}
