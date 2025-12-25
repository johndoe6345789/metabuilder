import { LUA_SNIPPETS, LUA_SNIPPET_CATEGORIES, type LuaSnippet } from './snippets/lua-snippets-data'
import { getSnippetsByCategory } from './functions/get-snippets-by-category'
import { searchSnippets } from './functions/search-snippets'
import { getSnippetById } from './functions/get-snippet-by-id'

/**
 * LuaSnippetUtils - Class wrapper for Lua snippet utility functions
 * 
 * This class serves as a container for lambda functions related to Lua snippets.
 * Each method delegates to an individual function file in the functions/ directory.
 * 
 * Pattern: "class is container for lambdas"
 * - Each lambda is defined in its own file under functions/
 * - This class wraps them for convenient namespaced access
 * - Can be used as LuaSnippetUtils.methodName() or import individual functions
 */
export class LuaSnippetUtils {
  /** All available snippet categories */
  static readonly CATEGORIES = LUA_SNIPPET_CATEGORIES

  /** All available snippets */
  static readonly ALL_SNIPPETS = LUA_SNIPPETS

  /**
   * Get snippets filtered by category
   */
  static getByCategory = getSnippetsByCategory

  /**
   * Search snippets by query string
   */
  static search = searchSnippets

  /**
   * Get a snippet by its ID
   */
  static getById = getSnippetById

  /**
   * Get count of snippets per category
   */
  static getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = { All: LUA_SNIPPETS.length }
    
    for (const snippet of LUA_SNIPPETS) {
      counts[snippet.category] = (counts[snippet.category] || 0) + 1
    }
    
    return counts
  }

  /**
   * Get all unique tags across snippets
   */
  static getAllTags(): string[] {
    const tagSet = new Set<string>()
    
    for (const snippet of LUA_SNIPPETS) {
      for (const tag of snippet.tags) {
        tagSet.add(tag)
      }
    }
    
    return Array.from(tagSet).sort()
  }
}

// Re-export types for convenience
export type { LuaSnippet }
export { LUA_SNIPPET_CATEGORIES, LUA_SNIPPETS }
