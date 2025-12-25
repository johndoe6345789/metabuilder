import { LUA_SNIPPETS, type LuaSnippet } from '../snippets/lua-snippets-data'

/**
 * Get a snippet by its ID
 * @param id - Snippet ID
 * @returns The snippet or undefined if not found
 */
export const getSnippetById = (id: string): LuaSnippet | undefined => {
  return LUA_SNIPPETS.find(snippet => snippet.id === id)
}
