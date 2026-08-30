/** The two calls this route makes to the data layer. */

import 'server-only'
import { db } from '@/lib/db-client'
import type { WorkflowListQuery } from './list-query'

export interface WorkflowPage {
  items: Record<string, unknown>[]
  total: number
}

export async function listWorkflows(
  query: WorkflowListQuery
): Promise<WorkflowPage> {
  const result = await db.workflows.list({
    filter: query.filter,
    limit: query.limit,
    offset: query.offset,
  })
  return { items: result.data, total: result.total ?? result.data.length }
}

export async function createWorkflow(
  record: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return db.workflows.create(record)
}
