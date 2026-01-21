/**
 * Main database module - Re-exports from focused modules
 * This file maintains backward compatibility while delegating to specialized modules
 */

// Re-export core database functions
export { initDB } from './db-core/initDB'
export { saveDB } from './db-core/saveDB'
export { exportDatabase } from './db-core/exportDatabase'
export { importDatabase } from './db-core/importDatabase'
export { getDatabaseStats } from './db-core/getDatabaseStats'
export { clearDatabase } from './db-core/clearDatabase'

// Re-export snippet operations
export { getAllSnippets } from './db-snippets/getAllSnippets'
export { getSnippet } from './db-snippets/getSnippet'
export { createSnippet } from './db-snippets/createSnippet'
export { updateSnippet } from './db-snippets/updateSnippet'
export { deleteSnippet } from './db-snippets/deleteSnippet'
export { getSnippetsByNamespace } from './db-snippets/getSnippetsByNamespace'
export { moveSnippetToNamespace } from './db-snippets/moveSnippetToNamespace'
export { bulkMoveSnippets } from './db-snippets/bulkMoveSnippets'
export { getAllTemplates } from './db-snippets/getAllTemplates'
export { createTemplate } from './db-snippets/createTemplate'
export { syncTemplatesFromJSON } from './db-snippets/syncTemplatesFromJSON'
export { seedDatabase } from './db-snippets/seedDatabase'

// Re-export namespace operations
export { getAllNamespaces } from './db-namespaces/getAllNamespaces'
export { createNamespace } from './db-namespaces/createNamespace'
export { deleteNamespace } from './db-namespaces/deleteNamespace'
export { ensureDefaultNamespace } from './db-namespaces/ensureDefaultNamespace'
export { getNamespaceById } from './db-namespaces/getNamespaceById'

// Re-export schema validation
export { validateDatabaseSchema } from './db-schema'

// Note: saveDB is intentionally not exported as it's used internally by the modules
