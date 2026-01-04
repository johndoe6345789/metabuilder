/**
 * Load page from database stub
 * TODO: Implement page loading from database
 */
export const loadPageFromDb = async () => null

export type LuaActionHandler = (action: string, data?: any) => void
export interface UIPageData {
  id: string
  title: string
  components: any[]
}
