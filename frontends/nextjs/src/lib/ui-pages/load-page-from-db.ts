/**
 * Load UI page from database (stub)
 */

import type { PageConfig } from '../types/level-types'

export type LuaActionHandler = (action: string, data: Record<string, unknown>) => void | Promise<void>

export interface UIPageData {
  layout: unknown
  actions?: Record<string, LuaActionHandler>
}

export function loadPageFromDb(_path: string, _tenantId?: string): Promise<PageConfig | null> {
  // TODO: Implement page loading from database
  return Promise.resolve(null)
}
