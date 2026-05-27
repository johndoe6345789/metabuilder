/**
 * IndexedDB Storage barrel — re-exports from split modules
 */

export {
  DB_NAME,
  DB_VERSION,
  SNIPPETS_STORE,
  NAMESPACES_STORE,
  SNIPPET_COMMENTS_STORE,
  PROFILE_COMMENTS_STORE,
  openDB,
} from './indexeddb-core.js'

export {
  getAllSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  getSnippetsByNamespace,
} from './indexeddb-snippets.js'

export {
  getAllNamespaces,
  getNamespace,
  createNamespace,
  updateNamespace,
  deleteNamespace,
} from './indexeddb-namespaces.js'

export {
  getSnippetComments,
  createSnippetComment,
  getProfileComments,
  createProfileComment,
} from './indexeddb-comments.js'

export {
  clearDatabase,
  getDatabaseStats,
  exportDatabase,
  importDatabase,
} from './indexeddb-db-ops.js'
