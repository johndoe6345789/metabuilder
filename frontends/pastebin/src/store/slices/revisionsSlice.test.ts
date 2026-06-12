import { configureStore } from '@reduxjs/toolkit'
import revisionsReducer, {
  fetchRevisions,
  revertToRevision,
  forkSnippet,
  forkSharedSnippet,
} from './revisionsSlice'

jest.mock('@/lib/storage', () => ({
  getStorageConfig: jest.fn(() => ({ dbalUrl: 'http://localhost:8080' })),
}))
jest.mock('@/lib/authToken', () => ({
  getAuthToken: jest.fn(() => null),
}))

function makeStore() {
  return configureStore({ reducer: { revisions: revisionsReducer } })
}

const mockRevision = {
  id: 'rev1',
  snippetId: 'snip1',
  code: 'const x = 1',
  createdAt: 1000,
}

const mockSnippet = {
  id: 'snip1',
  title: 'My snippet',
  description: '',
  code: 'const x = 1',
  language: 'javascript',
  category: 'general',
  createdAt: 1000,
  updatedAt: 1000,
}

describe('revisionsSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const store = makeStore()
      const state = store.getState().revisions
      expect(state.bySnippetId).toEqual({})
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('fetchRevisions thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(fetchRevisions.pending('req', 'snip1'))
      expect(store.getState().revisions.loading).toBe(true)
      expect(store.getState().revisions.error).toBeNull()
    })

    it('stores revisions by snippetId on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchRevisions.fulfilled(
          { snippetId: 'snip1', revisions: [mockRevision] },
          'req',
          'snip1',
        ),
      )
      expect(store.getState().revisions.loading).toBe(false)
      expect(store.getState().revisions.bySnippetId['snip1']).toHaveLength(1)
      expect(store.getState().revisions.bySnippetId['snip1'][0].id).toBe('rev1')
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        fetchRevisions.rejected(new Error('fetch failed'), 'req', 'snip1'),
      )
      const state = store.getState().revisions
      expect(state.loading).toBe(false)
      expect(state.error).toBe('fetch failed')
    })

    it('uses fallback message when error has no message', () => {
      const store = makeStore()
      const err = new Error()
      err.message = ''
      store.dispatch(fetchRevisions.rejected(err, 'req', 'snip1'))
      expect(store.getState().revisions.error).toBe('Failed to fetch revisions')
    })

    it('fetches and stores revisions from DBAL', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            data: [
              {
                id: 'rev2',
                snippetId: 'snip2',
                code: 'y=2',
                createdAt: '2000',
              },
            ],
          },
        }),
      })
      const store = makeStore()
      await store.dispatch(fetchRevisions('snip2'))
      expect(store.getState().revisions.bySnippetId['snip2']).toHaveLength(1)
      expect(store.getState().revisions.bySnippetId['snip2'][0].id).toBe('rev2')
    })

    it('throws when fetch returns non-ok', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: false, statusText: 'Not Found' })
      const store = makeStore()
      await store.dispatch(fetchRevisions('missing'))
      expect(store.getState().revisions.error).toContain(
        'Failed to fetch revisions',
      )
    })
  })

  describe('revertToRevision thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(
        revertToRevision.pending('req', { snippetId: 's1', revisionId: 'r1' }),
      )
      expect(store.getState().revisions.loading).toBe(true)
    })

    it('clears loading on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        revertToRevision.fulfilled(mockSnippet, 'req', {
          snippetId: 's1',
          revisionId: 'r1',
        }),
      )
      expect(store.getState().revisions.loading).toBe(false)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        revertToRevision.rejected(new Error('revert failed'), 'req', {
          snippetId: 's1',
          revisionId: 'r1',
        }),
      )
      expect(store.getState().revisions.error).toBe('revert failed')
    })
  })

  describe('forkSnippet thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(
        forkSnippet.pending('req', { snippetId: 's1', title: 'Fork' }),
      )
      expect(store.getState().revisions.loading).toBe(true)
    })

    it('clears loading on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        forkSnippet.fulfilled(mockSnippet, 'req', {
          snippetId: 's1',
          title: 'Fork',
        }),
      )
      expect(store.getState().revisions.loading).toBe(false)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        forkSnippet.rejected(new Error('fork failed'), 'req', {
          snippetId: 's1',
          title: 'Fork',
        }),
      )
      expect(store.getState().revisions.error).toBe('fork failed')
    })

    it('uses fallback message when no error message', () => {
      const store = makeStore()
      store.dispatch(
        forkSnippet.rejected(new Error(''), 'req', {
          snippetId: 's1',
          title: 'Fork',
        }),
      )
      expect(store.getState().revisions.error).toBe('Failed to fork snippet')
    })
  })

  describe('forkSharedSnippet thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(
        forkSharedSnippet.pending('req', { token: 'tok', title: 'Fork' }),
      )
      expect(store.getState().revisions.loading).toBe(true)
    })

    it('clears loading on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        forkSharedSnippet.fulfilled(mockSnippet, 'req', {
          token: 'tok',
          title: 'Fork',
        }),
      )
      expect(store.getState().revisions.loading).toBe(false)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        forkSharedSnippet.rejected(new Error('fork shared failed'), 'req', {
          token: 't',
          title: 'F',
        }),
      )
      expect(store.getState().revisions.error).toBe('fork shared failed')
    })

    it('uses fallback message when no error message', () => {
      const store = makeStore()
      store.dispatch(
        forkSharedSnippet.rejected(new Error(''), 'req', {
          token: 't',
          title: 'F',
        }),
      )
      expect(store.getState().revisions.error).toBe(
        'Failed to fork shared snippet',
      )
    })
  })

  describe('persist/REHYDRATE matcher', () => {
    it('resets loading and error on rehydrate', () => {
      const store = makeStore()
      store.dispatch(fetchRevisions.pending('req', 'snip1'))
      store.dispatch({ type: 'persist/REHYDRATE', payload: {} })
      expect(store.getState().revisions.loading).toBe(false)
      expect(store.getState().revisions.error).toBeNull()
    })
  })

  describe('revertToRevision integration', () => {
    it('fetches revision then updates snippet', async () => {
      const revisionData = {
        data: {
          id: 'rev1',
          snippetId: 'snip1',
          code: 'reverted',
          createdAt: '1000',
        },
      }
      const updatedSnippet = {
        data: { ...mockSnippet, code: 'reverted', updatedAt: '2000' },
      }
      let callCount = 0
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ ok: true, json: async () => revisionData })
        }
        return Promise.resolve({ ok: true, json: async () => updatedSnippet })
      })
      const store = makeStore()
      await store.dispatch(
        revertToRevision({ snippetId: 'snip1', revisionId: 'rev1' }),
      )
      expect(store.getState().revisions.loading).toBe(false)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('fails if revision fetch returns non-ok', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: false, statusText: 'Not Found' })
      const store = makeStore()
      await store.dispatch(
        revertToRevision({ snippetId: 'snip1', revisionId: 'r-gone' }),
      )
      expect(store.getState().revisions.error).toContain(
        'Failed to fetch revision',
      )
    })

    it('fails if snippet update returns non-ok', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              id: 'rev1',
              snippetId: 'snip1',
              code: 'x',
              createdAt: '1000',
            },
          }),
        })
        .mockResolvedValueOnce({ ok: false, statusText: 'Server Error' })
      const store = makeStore()
      await store.dispatch(
        revertToRevision({ snippetId: 'snip1', revisionId: 'rev1' }),
      )
      expect(store.getState().revisions.error).toContain(
        'Failed to revert snippet',
      )
    })
  })

  describe('forkSnippet integration', () => {
    it('fetches original snippet then creates fork', async () => {
      const origData = {
        data: {
          ...mockSnippet,
          namespaceId: 'ns1',
          hasPreview: false,
          isTemplate: false,
        },
      }
      const forkData = { data: { ...mockSnippet, id: 'fork-1', title: 'Fork' } }
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => origData })
        .mockResolvedValueOnce({ ok: true, json: async () => forkData })
      const store = makeStore()
      await store.dispatch(forkSnippet({ snippetId: 'snip1', title: 'Fork' }))
      expect(store.getState().revisions.loading).toBe(false)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('fails if snippet fetch returns non-ok', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: false, statusText: 'Not Found' })
      const store = makeStore()
      await store.dispatch(forkSnippet({ snippetId: 'gone', title: 'Fork' }))
      expect(store.getState().revisions.error).toContain(
        'Failed to fetch snippet',
      )
    })

    it('fails if fork creation returns non-ok', async () => {
      const origData = { data: { ...mockSnippet } }
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => origData })
        .mockResolvedValueOnce({ ok: false, statusText: 'Server Error' })
      const store = makeStore()
      await store.dispatch(forkSnippet({ snippetId: 'snip1', title: 'Fork' }))
      expect(store.getState().revisions.error).toContain(
        'Failed to fork snippet',
      )
    })
  })

  describe('forkSharedSnippet integration', () => {
    it('finds snippet by token then creates fork', async () => {
      const searchData = { data: { data: [{ ...mockSnippet }] } }
      const forkData = {
        data: { ...mockSnippet, id: 'fork-2', title: 'Fork Shared' },
      }
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => searchData })
        .mockResolvedValueOnce({ ok: true, json: async () => forkData })
      const store = makeStore()
      await store.dispatch(
        forkSharedSnippet({ token: 'share-tok', title: 'Fork Shared' }),
      )
      expect(store.getState().revisions.loading).toBe(false)
    })

    it('fails if shared snippet search returns non-ok', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: false, statusText: 'Not Found' })
      const store = makeStore()
      await store.dispatch(forkSharedSnippet({ token: 'bad', title: 'Fork' }))
      expect(store.getState().revisions.error).toContain(
        'Failed to find shared snippet',
      )
    })

    it('fails if shared snippet not found (empty array)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { data: [] } }),
      })
      const store = makeStore()
      await store.dispatch(
        forkSharedSnippet({ token: 'missing', title: 'Fork' }),
      )
      expect(store.getState().revisions.error).toContain(
        'Shared snippet not found',
      )
    })

    // eslint-disable-next-line max-len
    it('includes files in forked snippet body when files are present', async () => {
      const snippetWithFiles = {
        ...mockSnippet,
        files: [{ name: 'main.py', content: 'print()' }],
      }
      const searchData = { data: { data: [snippetWithFiles] } }
      const forkData = { data: { ...snippetWithFiles, id: 'fork-3' } }
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => searchData })
        .mockResolvedValueOnce({ ok: true, json: async () => forkData })
      const store = makeStore()
      await store.dispatch(
        forkSharedSnippet({ token: 'has-files', title: 'Fork' }),
      )
      // Second call body should contain files JSON
      const secondCall = (global.fetch as jest.Mock).mock.calls[1]
      const body = JSON.parse(secondCall[1].body)
      expect(body.files).toContain('main.py')
    })
  })

  describe('multiple snippets', () => {
    it('stores revisions for different snippet IDs independently', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchRevisions.fulfilled(
          {
            snippetId: 'a',
            revisions: [{ ...mockRevision, snippetId: 'a', id: 'ra' }],
          },
          'req',
          'a',
        ),
      )
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchRevisions.fulfilled(
          {
            snippetId: 'b',
            revisions: [{ ...mockRevision, snippetId: 'b', id: 'rb' }],
          },
          'req',
          'b',
        ),
      )
      expect(store.getState().revisions.bySnippetId['a'][0].id).toBe('ra')
      expect(store.getState().revisions.bySnippetId['b'][0].id).toBe('rb')
    })
  })
})
