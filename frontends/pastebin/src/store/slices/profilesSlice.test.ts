import { configureStore } from '@reduxjs/toolkit'
import profilesReducer, {
  fetchUserProfile,
  updateMyProfile,
} from './profilesSlice'

jest.mock('@/lib/authToken', () => ({
  getAuthToken: jest.fn(() => null),
}))

function makeStore() {
  return configureStore({ reducer: { profiles: profilesReducer } })
}

const mockProfile = {
  id: 'u1',
  username: 'alice',
  bio: 'Hello world',
  createdAt: 1000,
}

describe('profilesSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const store = makeStore()
      const state = store.getState().profiles
      expect(state.byUsername).toEqual({})
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('fetchUserProfile thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(fetchUserProfile.pending('req', 'alice'))
      expect(store.getState().profiles.loading).toBe(true)
      expect(store.getState().profiles.error).toBeNull()
    })

    it('stores profile by username on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchUserProfile.fulfilled(mockProfile, 'req', 'alice'),
      )
      const state = store.getState().profiles
      expect(state.loading).toBe(false)
      expect(state.byUsername['alice']).toEqual(mockProfile)
    })

    it('does not store profile when payload is null', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchUserProfile.fulfilled(null, 'req', 'nobody'),
      )
      expect(store.getState().profiles.byUsername['nobody']).toBeUndefined()
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchUserProfile.rejected(null, 'req', 'alice', 'Profile not found'),
      )
      const state = store.getState().profiles
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Profile not found')
    })

    it('fetches profile from API on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'u2',
          username: 'bob',
          bio: 'Hi',
          createdAt: 2000,
        }),
      })
      const store = makeStore()
      await store.dispatch(fetchUserProfile('bob'))
      expect(store.getState().profiles.byUsername['bob']?.username).toBe('bob')
    })

    it('rejects with server error on non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({}),
      })
      const store = makeStore()
      await store.dispatch(fetchUserProfile('ghost'))
      expect(store.getState().profiles.error).toContain(
        'Failed to fetch profile',
      )
    })

    it('rejects with "Network error" when fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('net'))
      const store = makeStore()
      await store.dispatch(fetchUserProfile('alice'))
      expect(store.getState().profiles.error).toBe('Network error')
    })

    it('returns null when profile has no id', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ username: 'nobody' }),
      })
      const store = makeStore()
      await store.dispatch(fetchUserProfile('nobody'))
      expect(store.getState().profiles.byUsername['nobody']).toBeUndefined()
    })
  })

  describe('updateMyProfile thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(updateMyProfile.pending('req', 'New bio'))
      expect(store.getState().profiles.loading).toBe(true)
    })

    it('stores updated profile on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        updateMyProfile.fulfilled(mockProfile, 'req', 'Hello world'),
      )
      const state = store.getState().profiles
      expect(state.loading).toBe(false)
      expect(state.byUsername['alice']).toEqual(mockProfile)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        updateMyProfile.rejected(null, 'req', 'bio', 'Update failed'),
      )
      expect(store.getState().profiles.error).toBe('Update failed')
    })

    it('calls PUT /api/profile', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'u1',
          username: 'alice',
          bio: 'Updated',
          createdAt: 1000,
        }),
      })
      const store = makeStore()
      await store.dispatch(updateMyProfile('Updated'))
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/profile'),
        expect.objectContaining({ method: 'PUT' }),
      )
    })

    it('rejects with "Network error" when fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('net'))
      const store = makeStore()
      await store.dispatch(updateMyProfile('bio'))
      expect(store.getState().profiles.error).toBe('Network error')
    })
  })

  describe('persist/REHYDRATE matcher', () => {
    it('resets loading and error on rehydrate', () => {
      const store = makeStore()
      store.dispatch(fetchUserProfile.pending('req', 'alice'))
      store.dispatch({ type: 'persist/REHYDRATE', payload: {} })
      expect(store.getState().profiles.loading).toBe(false)
      expect(store.getState().profiles.error).toBeNull()
    })
  })

  describe('multiple profiles', () => {
    it('stores profiles by different usernames independently', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchUserProfile.fulfilled(
          { id: 'a', username: 'alice', bio: '', createdAt: 1 },
          'req',
          'alice',
        ),
      )
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchUserProfile.fulfilled(
          { id: 'b', username: 'bob', bio: '', createdAt: 2 },
          'req',
          'bob',
        ),
      )
      expect(store.getState().profiles.byUsername['alice'].id).toBe('a')
      expect(store.getState().profiles.byUsername['bob'].id).toBe('b')
    })
  })
})
