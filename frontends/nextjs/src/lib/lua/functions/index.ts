/**
 * Lua Functions Index
 * Exports all Lua engine functions and snippet utilities
 */

// Types
export type { LuaExecutionContext, LuaExecutionResult } from './types'

// Converters
export { fromLua } from './converters/from-lua'
export { pushToLua } from './converters/push-to-lua'
export { tableToJS } from './converters/table-to-js'

// Setup
export { setupContextAPI } from './setup/setup-context-api'

// Execution
export { executeLuaCode } from './execution/execute-lua-code'

// Snippet utilities
export { getAllSnippetTags } from './snippets/get-all-snippet-tags'
export { getSnippetById } from './snippets/get-snippet-by-id'
export { getSnippetCategoryCounts } from './snippets/get-snippet-category-counts'
export { getSnippetsByCategory } from './snippets/get-snippets-by-category'
export { searchSnippets } from './snippets/search-snippets'
