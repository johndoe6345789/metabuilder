import { LUA_SNIPPETS, type LuaSnippet } from '../../snippets/lua-snippets-data'

/**
 * Search snippets by query string
 * @param query - Search query
 * @returns Array of matching snippets
 */
export const searchSnippets = (query: string): LuaSnippet[] => {
  const lowerQuery = query.toLowerCase()
  return LUA_SNIPPETS.filter(snippet => 
    snippet.name.toLowerCase().includes(lowerQuery) ||
    snippet.description.toLowerCase().includes(lowerQuery) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
