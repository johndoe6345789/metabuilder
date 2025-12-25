/**
 * Lua Functions Index
 * Exports all Lua engine functions and snippet utilities
 */

// Types
export type { LuaExecutionContext, LuaExecutionResult } from './types'

// Converters
export { pushToLua } from './converters/push-to-lua'
export { fromLua } from './converters/from-lua'
export { tableToJS } from './converters/table-to-js'

// Setup
export { setupContextAPI } from './setup/setup-context-api'

// Execution
export { executeLuaCode } from './execution/execute-lua-code'

// Snippet utilities
export { getSnippetsByCategory } from './get-snippets-by-category'
export { searchSnippets } from './search-snippets'
export { getSnippetById } from './get-snippet-by-id'
export { getSnippetCategoryCounts } from './get-snippet-category-counts'
export { getAllSnippetTags } from './get-all-snippet-tags'
