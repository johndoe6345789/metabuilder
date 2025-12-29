import { getSchemas as fetchSchemas } from '@/lib/db/schemas'
import type { ModelSchema } from '@/lib/types/schema-types'

import { executeQuery } from '../../execute-query'
import type { SecurityContext } from '../types'

/**
 * Get model schemas with security checks
 */
export async function getModelSchemas(ctx: SecurityContext): Promise<ModelSchema[]> {
  return executeQuery(ctx, 'modelSchema', 'READ', async () => fetchSchemas(), 'all_model_schemas')
}
