import { createSlice, type Action } from '@reduxjs/toolkit'
import { setAuthToken } from '@/lib/authToken'
import {
  loginUser,
  registerUser,
  validateToken,
  completeOidcLogin,
  onFulfilled,
  isTokenValid,
} from './authThunks'
import type { AuthUser, AuthState } from './authThunks'

export { loginUser, registerUser, validateToken, completeOidcLogin }
export type { AuthUser }

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const onPending = (state: AuthState) => {
  state.loading = true
  state.error = null
}
const onRejected = (state: AuthState, action: { payload: unknown }) => {
  state.loading = false
  state.error = action.payload as string
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
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
    seedToken(state) {
      if (state.token) setAuthToken(state.token)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, onPending)
      .addCase(loginUser.fulfilled, onFulfilled)
      .addCase(loginUser.rejected, onRejected)
      .addCase(registerUser.pending, onPending)
      .addCase(registerUser.fulfilled, onFulfilled)
      .addCase(registerUser.rejected, onRejected)
      .addCase(completeOidcLogin.pending, onPending)
      .addCase(completeOidcLogin.fulfilled, onFulfilled)
      .addCase(completeOidcLogin.rejected, onRejected)
      .addCase(validateToken.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        setAuthToken(action.payload.token)
      })
      .addCase(validateToken.rejected, state => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        setAuthToken(null)
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
          }
        },
      )
  },
})

export const { logout, clearError, seedToken } = authSlice.actions
export default authSlice.reducer
