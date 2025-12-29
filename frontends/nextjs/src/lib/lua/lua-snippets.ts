/**
 * Lua Snippets - Re-exports for backward compatibility
 *
 * Prefer importing from LuaSnippetUtils class or individual functions:
 *
 * @example
 * // Class pattern (recommended)
 * import { LuaSnippetUtils } from '@/lib/lua/LuaSnippetUtils'
 * const snippets = LuaSnippetUtils.getByCategory('Validation')
 *
 * @example
 * // Individual function import
 * import { getSnippetsByCategory } from '@/lib/lua/functions/get-snippets-by-category'
 */

// Re-export types and data
export type { LuaSnippet } from './snippets'
export { LUA_SNIPPET_CATEGORIES, LUA_SNIPPETS } from './snippets'

// Re-export functions for backward compatibility
export { getSnippetById } from './functions/snippets/get-snippet-by-id'
export { getSnippetsByCategory } from './functions/snippets/get-snippets-by-category'
export { searchSnippets } from './functions/snippets/search-snippets'

// Re-export class wrapper
export { LuaSnippetUtils } from './LuaSnippetUtils'
