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
} from './indexeddb-core'

export {
  getAllSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  getSnippetsByNamespace,
} from './indexeddb-snippets'

export {
  getAllNamespaces,
  getNamespace,
  createNamespace,
  updateNamespace,
  deleteNamespace,
} from './indexeddb-namespaces'

export {
  getSnippetComments,
  createSnippetComment,
  getProfileComments,
  createProfileComment,
} from './indexeddb-comments'

export {
  clearDatabase,
  getDatabaseStats,
  exportDatabase,
  importDatabase,
} from './indexeddb-db-ops'
