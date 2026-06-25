import snippetsReducer from './slices/snippetsSlice'
import namespacesReducer from './slices/namespacesSlice'
import uiReducer from './slices/uiSlice'
import authReducer from './slices/authSlice'
import commentsReducer from './slices/commentsSlice'
import revisionsReducer from './slices/revisionsSlice'
import shareReducer from './slices/shareSlice'
import profilesReducer from './slices/profilesSlice'

/**
 * Single source of truth for the app's slice reducers. Used by the persisted
 * production store (store/index.ts) and by the plain test store factory
 * (test-utils) so the two can never drift apart.
 */
export const rootReducers = {
  snippets: snippetsReducer,
  namespaces: namespacesReducer,
  ui: uiReducer,
  auth: authReducer,
  comments: commentsReducer,
  revisions: revisionsReducer,
  share: shareReducer,
  profiles: profilesReducer,
}

/** The slice keys persisted to storage. */
export const persistWhitelist = Object.keys(rootReducers)
