import { createPersistedStore } from '@metabuilder/redux-persist'
import { type ThunkDispatch, type UnknownAction } from '@reduxjs/toolkit'
import { rootReducers, persistWhitelist } from './rootReducer'
import { setAuthToken } from '@/lib/authToken'
import { validateToken } from './slices/authSlice'

const { store, persistor } = createPersistedStore({
  reducers: rootReducers,
  persist: {
    key: 'pastebin',
    whitelist: persistWhitelist,
    throttle: 100,
  },
  devTools: {
    name: 'CodeSnippet',
    trace: true,
    traceLimit: 25,
  },
})

// Keep the token bridge in sync with Redux auth state.
// eslint-disable-next-line max-len
// store.subscribe fires on REHYDRATE too, so this handles page-reload token restoration.
store.subscribe(() => setAuthToken(store.getState().auth.token))

// After rehydration, validate the persisted token against the server.
// If invalid/expired, the user is logged out automatically.
let _validated = false
persistor.subscribe(() => {
  const { bootstrapped } = persistor.getState()
  if (bootstrapped && !_validated) {
    _validated = true
    if (store.getState().auth.token) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(store.dispatch as ThunkDispatch<any, any, UnknownAction>)(
        validateToken(),
      )
    }
  }
})

export { store, persistor }

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = ThunkDispatch<RootState, undefined, UnknownAction>
