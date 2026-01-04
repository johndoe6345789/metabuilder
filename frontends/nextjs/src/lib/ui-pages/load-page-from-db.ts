/**
 * Load page from database stub
 * TODO: Implement page loading from database
 */
export const loadPageFromDb = async (path?: string) => null
export const loadPageFromDB = loadPageFromDb  // Alias for compatibility

export type LuaActionHandler = (action: string, data?: any) => void
export interface UIPageData {
  id: string
  title: string
  components: any[]
  layout?: string
}
