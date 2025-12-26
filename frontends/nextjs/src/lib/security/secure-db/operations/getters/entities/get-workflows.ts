import { getWorkflows as fetchWorkflows } from '@/lib/db/workflows'
import type { Workflow } from '@/lib/types/level-types'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'

/**
 * Get workflows with security checks
 */
export async function getWorkflows(ctx: SecurityContext): Promise<Workflow[]> {
  return executeQuery(
    ctx,
    'workflow',
    'READ',
    async () => fetchWorkflows(),
    'all_workflows'
  )
}
