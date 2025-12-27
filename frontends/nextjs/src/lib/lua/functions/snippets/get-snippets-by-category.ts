import { LUA_SNIPPETS, type LuaSnippet } from '../../snippets'

/**
 * Get snippets filtered by category
 * @param category - Category name or 'All' for all snippets
 * @returns Array of matching snippets
 */
export const getSnippetsByCategory = (category: string): LuaSnippet[] => {
  if (category === 'All') {
    return LUA_SNIPPETS
  }
  return LUA_SNIPPETS.filter(snippet => snippet.category === category)
}
