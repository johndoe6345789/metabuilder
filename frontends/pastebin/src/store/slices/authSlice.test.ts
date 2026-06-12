import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  logout,
  clearError,
  seedToken,
  loginUser,
  registerUser,
  validateToken,
} from './authSlice'
import { setAuthToken, getAuthToken } from '@/lib/authToken'

// Reset the token bridge between tests
afterEach(() => {
  setAuthToken(null)
})

function makeStore() {
  return configureStore({ reducer: { auth: authReducer } })
}

// eslint-disable-next-line max-len
// Build a minimal valid JWT whose payload contains exp (far future) and given fields.
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('authSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const store = makeStore()
      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('logout reducer', () => {
    it('clears user, token, and isAuthenticated', () => {
      const store = makeStore()
      // Manually seed state via fulfilled action
      store.dispatch(
        // @ts-expect-error – direct payload injection for test
        loginUser.fulfilled(
          {
            token: makeJwt({ exp: Date.now() / 1000 + 3600 }),
            user: { id: '1', username: 'alice' },
          },
          '',
          {},
        ),
      )
      store.dispatch(logout())
      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBeNull()
    })

    it('resets the token bridge to null', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error – direct payload injection
        loginUser.fulfilled(
          { token: 'tok', user: { id: '1', username: 'u' } },
          '',
          {},
        ),
      )
      store.dispatch(logout())
      expect(getAuthToken()).toBeNull()
    })
  })

  describe('clearError reducer', () => {
    it('clears the error field', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error – inject rejected state
        loginUser.rejected(null, '', {}, 'Bad creds'),
      )
      store.dispatch(clearError())
      expect(store.getState().auth.error).toBeNull()
    })

    it('is safe when error is already null', () => {
      const store = makeStore()
      store.dispatch(clearError())
      expect(store.getState().auth.error).toBeNull()
    })
  })

  describe('seedToken reducer', () => {
    it('does nothing when token is null', () => {
      const store = makeStore()
      store.dispatch(seedToken())
      expect(getAuthToken()).toBeNull()
    })

    it('sets the token bridge when a token is present', () => {
      const store = makeStore()
      const token = makeJwt({ exp: Date.now() / 1000 + 3600 })
      store.dispatch(
        // @ts-expect-error – inject fulfilled state
        loginUser.fulfilled(
          { token, user: { id: '1', username: 'u' } },
          '',
          {},
        ),
      )
      // Reset bridge to simulate fresh load
      setAuthToken(null)
      store.dispatch(seedToken())
      expect(getAuthToken()).toBe(token)
    })
  })

  describe('loginUser async thunk', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(loginUser.pending('req', { username: 'u', password: 'p' }))
      expect(store.getState().auth.loading).toBe(true)
      expect(store.getState().auth.error).toBeNull()
    })

    it('sets user, token, isAuthenticated on fulfilled', () => {
      const store = makeStore()
      const token = makeJwt({ exp: Date.now() / 1000 + 3600 })
      const user = { id: '42', username: 'bob' }
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        loginUser.fulfilled({ token, user }, 'req', {
          username: 'bob',
          password: 'pw',
        }),
      )
      const state = store.getState().auth
      expect(state.loading).toBe(false)
      expect(state.user).toEqual(user)
      expect(state.token).toBe(token)
      expect(state.isAuthenticated).toBe(true)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        loginUser.rejected(
          null,
          'req',
          { username: 'u', password: 'p' },
          'Bad creds',
        ),
      )
      const state = store.getState().auth
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Bad creds')
    })

    it('sets the token bridge on fulfilled', () => {
      const store = makeStore()
      const token = makeJwt({ exp: Date.now() / 1000 + 3600 })
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        loginUser.fulfilled(
          { token, user: { id: '1', username: 'u' } },
          'req',
          {},
        ),
      )
      expect(getAuthToken()).toBe(token)
    })

    it('calls /api/auth/login and returns data on success', async () => {
      const token = makeJwt({ exp: Date.now() / 1000 + 3600 })
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ token, user: { id: '1', username: 'alice' } }),
      })
      const store = makeStore()
      await store.dispatch(loginUser({ username: 'alice', password: 'pass' }))
      expect(store.getState().auth.isAuthenticated).toBe(true)
    })

    it('rejects with server error message on non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      })
      const store = makeStore()
      await store.dispatch(loginUser({ username: 'alice', password: 'wrong' }))
      expect(store.getState().auth.error).toBe('Invalid credentials')
    })

    it('rejects with "Network error" when fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('net error'))
      const store = makeStore()
      await store.dispatch(loginUser({ username: 'alice', password: 'pw' }))
      expect(store.getState().auth.error).toBe('Network error')
    })
  })

  describe('registerUser async thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(
        registerUser.pending('req', { username: 'u', password: 'p' }),
      )
      expect(store.getState().auth.loading).toBe(true)
    })

    it('sets user and token on fulfilled', () => {
      const store = makeStore()
      const token = makeJwt({ exp: Date.now() / 1000 + 3600 })
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        registerUser.fulfilled(
          { token, user: { id: '2', username: 'carol' } },
          'req',
          {},
        ),
      )
      expect(store.getState().auth.isAuthenticated).toBe(true)
    })

    it('calls /api/auth/register and sets token on success', async () => {
      const token = makeJwt({ exp: Date.now() / 1000 + 3600 })
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ token, user: { id: '2', username: 'carol' } }),
      })
      const store = makeStore()
      await store.dispatch(
        registerUser({ username: 'carol', password: 'pass' }),
      )
      expect(store.getState().auth.isAuthenticated).toBe(true)
    })

    it('rejects with "Network error" when fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error())
      const store = makeStore()
      await store.dispatch(registerUser({ username: 'u', password: 'p' }))
      expect(store.getState().auth.error).toBe('Network error')
    })
  })

  describe('validateToken async thunk', () => {
    it('clears auth on rejected', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        validateToken.rejected(null, 'req', undefined, 'Invalid token'),
      )
      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('sets user and isAuthenticated on fulfilled', () => {
      const store = makeStore()
      const token = makeJwt({ exp: Date.now() / 1000 + 3600 })
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        validateToken.fulfilled(
          { user: { id: '3', username: 'dan' }, token },
          'req',
          undefined,
        ),
      )
      const state = store.getState().auth
      expect(state.user?.username).toBe('dan')
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('persist/REHYDRATE matcher', () => {
    it('clears loading and error on rehydrate', () => {
      const store = makeStore()
      store.dispatch(loginUser.pending('req', { username: 'u', password: 'p' }))
      store.dispatch({ type: 'persist/REHYDRATE', payload: {} })
      const state = store.getState().auth
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('invalidates expired token on rehydrate', () => {
      const store = makeStore()
      // Inject an expired token into state
      const expiredToken = makeJwt({ exp: 1 }) // exp in 1970
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        loginUser.fulfilled(
          { token: expiredToken, user: { id: '1', username: 'u' } },
          'req',
          {},
        ),
      )
      store.dispatch({ type: 'persist/REHYDRATE', payload: {} })
      const state = store.getState().auth
      expect(state.isAuthenticated).toBe(false)
      expect(state.token).toBeNull()
    })
  })
})
