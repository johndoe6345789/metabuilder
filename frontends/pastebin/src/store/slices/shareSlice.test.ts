import { configureStore } from '@reduxjs/toolkit'
import shareReducer, {
  clearShareError,
  generateShareToken,
  revokeShareToken,
  fetchSharedSnippet,
} from './shareSlice'

jest.mock('@/lib/storage', () => ({
  getStorageConfig: jest.fn(() => ({ dbalUrl: 'http://localhost:8080' })),
}))
jest.mock('@/lib/authToken', () => ({
  getAuthToken: jest.fn(() => null),
}))

function makeStore() {
  return configureStore({ reducer: { share: shareReducer } })
}

describe('shareSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const store = makeStore()
      const state = store.getState().share
      expect(state.sharedSnippets).toEqual({})
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('clearShareError reducer', () => {
    it('clears the error field', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error – inject error via rejected action
        generateShareToken.rejected(null, '', 'snip-1', 'Network error')
      )
      store.dispatch(clearShareError())
      expect(store.getState().share.error).toBeNull()
    })
  })

  describe('generateShareToken thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(generateShareToken.pending('req', 'snip-1'))
      expect(store.getState().share.loading).toBe(true)
      expect(store.getState().share.error).toBeNull()
    })

    it('clears loading on fulfilled', () => {
      const store = makeStore()
      store.dispatch(generateShareToken.pending('req', 'snip-1'))
      store.dispatch(
        // @ts-expect-error
        generateShareToken.fulfilled({ snippetId: 'snip-1', token: 'tok' }, 'req', 'snip-1')
      )
      expect(store.getState().share.loading).toBe(false)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error
        generateShareToken.rejected(null, '', 'snip-1', 'Failed')
      )
      const state = store.getState().share
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Failed')
    })

    it('calls fetch PUT with shareToken body on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      const store = makeStore()
      await store.dispatch(generateShareToken('snip-1'))
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('snip-1'),
        expect.objectContaining({ method: 'PUT' })
      )
      expect(store.getState().share.loading).toBe(false)
    })

    it('rejects with "Network error" when fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('net'))
      const store = makeStore()
      await store.dispatch(generateShareToken('snip-1'))
      expect(store.getState().share.error).toBe('Network error')
    })

    it('rejects with server error message on non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Forbidden' }),
        statusText: 'Forbidden',
      })
      const store = makeStore()
      await store.dispatch(generateShareToken('snip-1'))
      expect(store.getState().share.error).toBe('Forbidden')
    })
  })

  describe('revokeShareToken thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(revokeShareToken.pending('req', 'snip-1'))
      expect(store.getState().share.loading).toBe(true)
    })

    it('clears loading on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error
        revokeShareToken.fulfilled('snip-1', 'req', 'snip-1')
      )
      expect(store.getState().share.loading).toBe(false)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error
        revokeShareToken.rejected(null, '', 'snip-1', 'Failed to revoke')
      )
      expect(store.getState().share.error).toBe('Failed to revoke')
    })

    it('sends PUT with null shareToken', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
      const store = makeStore()
      await store.dispatch(revokeShareToken('snip-2'))
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('snip-2'),
        expect.objectContaining({ method: 'PUT', body: expect.stringContaining('null') })
      )
    })
  })

  describe('fetchSharedSnippet thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(fetchSharedSnippet.pending('req', 'share-tok'))
      expect(store.getState().share.loading).toBe(true)
    })

    it('stores snippet by shareToken on fulfilled', () => {
      const store = makeStore()
      const snippet = {
        id: 's1',
        title: 'My snippet',
        description: '',
        code: 'print()',
        language: 'python',
        category: 'general',
        createdAt: 1000,
        updatedAt: 1000,
        shareToken: 'share-tok',
      }
      store.dispatch(
        // @ts-expect-error
        fetchSharedSnippet.fulfilled(snippet, 'req', 'share-tok')
      )
      expect(store.getState().share.sharedSnippets['share-tok']).toEqual(snippet)
    })

    it('does not store snippet when payload is null', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error
        fetchSharedSnippet.fulfilled(null, 'req', 'share-tok')
      )
      expect(store.getState().share.sharedSnippets['share-tok']).toBeUndefined()
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error
        fetchSharedSnippet.rejected(null, '', 'share-tok', 'Not found')
      )
      expect(store.getState().share.error).toBe('Not found')
    })

    it('fetches and parses snippet from DBAL on success', async () => {
      const raw = {
        id: 's2', title: 'T', description: '', code: 'x=1', language: 'python',
        category: 'g', createdAt: '1000', updatedAt: '1000', shareToken: 'abc',
      }
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { data: [raw] } }),
      })
      const store = makeStore()
      await store.dispatch(fetchSharedSnippet('abc'))
      expect(store.getState().share.sharedSnippets['abc']?.title).toBe('T')
    })

    it('returns null when data array is empty', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { data: [] } }),
      })
      const store = makeStore()
      const result = await store.dispatch(fetchSharedSnippet('empty'))
      // payload should be null; no snippet stored
      expect(store.getState().share.sharedSnippets['empty']).toBeUndefined()
      expect(result.type).toBe('share/fetchSharedSnippet/fulfilled')
    })

    it('rejects with "Network error" when fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('net'))
      const store = makeStore()
      await store.dispatch(fetchSharedSnippet('tok'))
      expect(store.getState().share.error).toBe('Network error')
    })
  })

  describe('persist/REHYDRATE matcher', () => {
    it('resets loading and error on rehydrate', () => {
      const store = makeStore()
      store.dispatch(fetchSharedSnippet.pending('req', 'tok'))
      store.dispatch({ type: 'persist/REHYDRATE', payload: {} })
      expect(store.getState().share.loading).toBe(false)
      expect(store.getState().share.error).toBeNull()
    })
  })
})
