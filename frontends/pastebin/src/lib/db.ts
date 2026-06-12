/**
 * Unified storage interface — re-exports from split modules
 */

export {
  getAllSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  getSnippetsByNamespace,
  moveSnippetToNamespace,
  bulkMoveSnippets,
  getAllTemplates,
  createTemplate,
  getAllNamespaces,
  getNamespaceById,
  createNamespace,
  updateNamespace,
  deleteNamespace,
  ensureDefaultNamespace,
} from './db-snippets'

export {
  initDB,
  clearDatabase,
  getDatabaseStats,
  exportDatabase,
  importDatabase,
  validateDatabaseSchema,
  syncTemplatesFromJSON,
  seedDatabase,
  getSnippetComments,
  createSnippetComment,
  getProfileComments,
  createProfileComment,
  saveDB,
} from './db-ops'
