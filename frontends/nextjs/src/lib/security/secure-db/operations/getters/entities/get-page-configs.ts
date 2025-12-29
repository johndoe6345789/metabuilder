import { getPages as fetchPages } from '@/lib/db/pages'
import type { PageConfig } from '@/lib/types/level-types'

import { executeQuery } from '../../execute-query'
import type { SecurityContext } from '../types'

/**
 * Get page configs with security checks
 */
export async function getPageConfigs(ctx: SecurityContext): Promise<PageConfig[]> {
  return executeQuery(ctx, 'pageConfig', 'READ', async () => fetchPages(), 'all_page_configs')
}
