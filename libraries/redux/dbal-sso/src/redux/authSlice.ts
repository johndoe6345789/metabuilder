import { createAsyncThunk, createSlice, type Action } from '@reduxjs/toolkit'
import type { DbalSsoConfig } from '../core/config'
import { beginLogin, completeLogin, logout as oidcLogout, type OidcUser } from '../core/oidcClient'
import { isTokenValid } from '../core/decodeJwt'
import { setAuthToken } from '../core/authToken'

export interface DbalSsoState {
  user: OidcUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: DbalSsoState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

/**
 * Builds a self-contained auth slice for one app's DBAL OIDC config. A
 * factory rather than a fixed module-level slice because each app needs
 * its own clientId/basePath baked into the thunks -- mirrors pastebin's
 * original authSlice.ts shape (user/token/refreshToken/isAuthenticated/
 * loading/error) so migrating it onto this package is close to a drop-in
 * swap. The slice's internal name ("dbalAuth", used only for the
 * action-type prefix) is independent of whatever key the consuming app
 * mounts the reducer under in its own store.
 */
export function createDbalSsoSlice(config: DbalSsoConfig) {
  const startOidcLogin = createAsyncThunk('dbalAuth/startOidcLogin', async () => {
    await beginLogin(config)
  })

  const completeOidcLogin = createAsyncThunk(
    'dbalAuth/completeOidcLogin',
    async ({ code, state }: { code: string; state: string }, { rejectWithValue }) => {
      try {
        return await completeLogin(config, code, state)
      } catch (e) {
        return rejectWithValue(e instanceof Error ? e.message : 'Sign-in failed')
      }
    },
  )

  const slice = createSlice({
    name: 'dbalAuth',
    initialState,
    reducers: {
      logout(state) {
        // Fire-and-forget the server-side revoke -- local state clears
        // immediately regardless (see oidcClient.logout's doc comment).
        void oidcLogout(config, state.refreshToken)
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
        setAuthToken(null)
      },
      clearError(state) {
        state.error = null
      },
      /** Call once after rehydrating persisted state, so the in-memory
       * token bridge (read by authenticatedFetch and any non-React code)
       * reflects a token that was only just restored into Redux state. */
      seedToken(state) {
        if (state.token) setAuthToken(state.token)
      },
      /** Used by authenticatedFetch's onRefreshed callback to push a
       * refreshed token set back into state without a full thunk round-trip. */
      tokensRefreshed(state, action: { payload: { token: string; refreshToken: string | null } }) {
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        setAuthToken(action.payload.token)
      },
    },
    extraReducers: builder => {
      builder
        .addCase(startOidcLogin.rejected, (state, action) => {
          state.error = action.error.message ?? 'Sign-in failed to start'
        })
        .addCase(completeOidcLogin.pending, state => {
          state.loading = true
          state.error = null
        })
        .addCase(completeOidcLogin.fulfilled, (state, action) => {
          const { token, user, refreshToken } = action.payload
          state.loading = false
          state.user = user
          state.token = token
          state.refreshToken = refreshToken
          state.isAuthenticated = true
          setAuthToken(token)
        })
        .addCase(completeOidcLogin.rejected, (state, action) => {
          state.loading = false
          state.error = (action.payload as string) ?? 'Sign-in failed'
        })
        .addMatcher(
          (action: Action) => action.type === 'persist/REHYDRATE',
          state => {
            state.error = null
            state.loading = false
            if (state.token && !isTokenValid(state.token)) {
              state.user = null
              state.token = null
              state.isAuthenticated = false
              setAuthToken(null)
            } else if (state.token) {
              setAuthToken(state.token)
            }
          },
        )
    },
  })

  return {
    reducer: slice.reducer,
    actions: slice.actions,
    thunks: { startOidcLogin, completeOidcLogin },
  }
}

export type DbalSsoSlice = ReturnType<typeof createDbalSsoSlice>
