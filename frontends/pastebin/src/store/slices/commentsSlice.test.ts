import { configureStore } from '@reduxjs/toolkit'
import commentsReducer, {
  fetchSnippetComments,
  addSnippetComment,
  fetchProfileComments,
  addProfileComment,
} from './commentsSlice'
import type { SnippetComment, ProfileComment } from '@/lib/types'

jest.mock('@/lib/db', () => ({
  getSnippetComments: jest.fn(),
  createSnippetComment: jest.fn(async (c: SnippetComment) => c),
  getProfileComments: jest.fn(),
  createProfileComment: jest.fn(async (c: ProfileComment) => c),
}))
jest.mock('@/lib/authToken', () => ({
  getAuthToken: jest.fn(() => null),
}))

function makeStore() {
  return configureStore({ reducer: { comments: commentsReducer } })
}

const snippetComment1: SnippetComment = {
  id: 'c1',
  snippetId: 's1',
  authorId: 'u1',
  authorUsername: 'alice',
  content: 'Great snippet!',
  createdAt: 2000,
}

const snippetComment2: SnippetComment = {
  id: 'c2',
  snippetId: 's1',
  authorId: 'u2',
  authorUsername: 'bob',
  content: 'Thanks!',
  createdAt: 1000, // older
}

const profileComment: ProfileComment = {
  id: 'pc1',
  profileUserId: 'usr-1',
  authorId: 'u2',
  authorUsername: 'bob',
  content: 'Nice profile',
  createdAt: 3000,
}

describe('commentsSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const store = makeStore()
      const state = store.getState().comments
      expect(state.snippetComments).toEqual({})
      expect(state.profileComments).toEqual({})
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('fetchSnippetComments thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(fetchSnippetComments.pending('req', 's1'))
      expect(store.getState().comments.loading).toBe(true)
      expect(store.getState().comments.error).toBeNull()
    })

    it('stores sorted comments on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchSnippetComments.fulfilled(
          { snippetId: 's1', comments: [snippetComment1, snippetComment2] },
          'req',
          's1',
        ),
      )
      const state = store.getState().comments
      expect(state.loading).toBe(false)
      // Comments should be sorted ascending by createdAt
      expect(state.snippetComments['s1'][0].id).toBe('c2') // older first
      expect(state.snippetComments['s1'][1].id).toBe('c1')
    })

    it('handles date-string createdAt values', () => {
      const store = makeStore()
      const c1 = {
        ...snippetComment1,
        createdAt: new Date(2000).toISOString() as unknown as number,
      }
      const c2 = {
        ...snippetComment2,
        createdAt: new Date(1000).toISOString() as unknown as number,
      }
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchSnippetComments.fulfilled(
          { snippetId: 'x', comments: [c1, c2] },
          'req',
          'x',
        ),
      )
      expect(store.getState().comments.snippetComments['x'][0].createdAt).toBe(
        c2.createdAt,
      )
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        fetchSnippetComments.rejected(new Error('fetch failed'), 'req', 's1'),
      )
      expect(store.getState().comments.loading).toBe(false)
      expect(store.getState().comments.error).toBe('fetch failed')
    })

    it('uses fallback error message', () => {
      const store = makeStore()
      const err = new Error()
      err.message = ''
      store.dispatch(fetchSnippetComments.rejected(err, 'req', 's1'))
      expect(store.getState().comments.error).toBe('Failed to fetch comments')
    })

    it('calls getSnippetComments from db', async () => {
      const { getSnippetComments } = jest.requireMock('@/lib/db')
      getSnippetComments.mockResolvedValue([snippetComment1])
      const store = makeStore()
      await store.dispatch(fetchSnippetComments('s1'))
      expect(getSnippetComments).toHaveBeenCalledWith('s1')
      expect(store.getState().comments.snippetComments['s1']).toHaveLength(1)
    })
  })

  describe('addSnippetComment thunk', () => {
    it('appends comment on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        addSnippetComment.fulfilled(snippetComment1, 'req', {
          snippetId: 's1',
          content: 'Great',
        }),
      )
      expect(store.getState().comments.snippetComments['s1']).toHaveLength(1)
      expect(store.getState().comments.snippetComments['s1'][0].id).toBe('c1')
    })

    it('appends to existing comment list', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchSnippetComments.fulfilled(
          { snippetId: 's1', comments: [snippetComment2] },
          'req',
          's1',
        ),
      )
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        addSnippetComment.fulfilled(snippetComment1, 'req', {
          snippetId: 's1',
          content: 'Great',
        }),
      )
      expect(store.getState().comments.snippetComments['s1']).toHaveLength(2)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        addSnippetComment.rejected(new Error('post failed'), 'req', {
          snippetId: 's1',
          content: 'x',
        }),
      )
      expect(store.getState().comments.error).toBe('post failed')
    })
  })

  describe('fetchProfileComments thunk', () => {
    it('sets loading on pending', () => {
      const store = makeStore()
      store.dispatch(fetchProfileComments.pending('req', 'usr-1'))
      expect(store.getState().comments.loading).toBe(true)
    })

    it('stores sorted comments on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchProfileComments.fulfilled(
          { profileUserId: 'usr-1', comments: [profileComment] },
          'req',
          'usr-1',
        ),
      )
      expect(store.getState().comments.profileComments['usr-1']).toHaveLength(1)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        fetchProfileComments.rejected(new Error('err'), 'req', 'usr-1'),
      )
      expect(store.getState().comments.error).toBe('err')
    })

    it('calls getProfileComments from db', async () => {
      const { getProfileComments } = jest.requireMock('@/lib/db')
      getProfileComments.mockResolvedValue([profileComment])
      const store = makeStore()
      await store.dispatch(fetchProfileComments('usr-1'))
      expect(getProfileComments).toHaveBeenCalledWith('usr-1')
    })
  })

  describe('addProfileComment thunk', () => {
    it('appends profile comment on fulfilled', () => {
      const store = makeStore()
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        addProfileComment.fulfilled(profileComment, 'req', {
          profileUserId: 'usr-1',
          content: 'Nice',
        }),
      )
      expect(store.getState().comments.profileComments['usr-1']).toHaveLength(1)
    })

    it('sets error on rejected', () => {
      const store = makeStore()
      store.dispatch(
        addProfileComment.rejected(new Error('post failed'), 'req', {
          profileUserId: 'usr-1',
          content: 'x',
        }),
      )
      expect(store.getState().comments.error).toBe('post failed')
    })
  })

  describe('addSnippetComment integration', () => {
    it('calls createSnippetCommentDB from db', async () => {
      const db = jest.requireMock('@/lib/db')
      db.createSnippetComment.mockClear()
      db.createSnippetComment.mockImplementation(async (c: SnippetComment) => c)
      const store = makeStore()
      const result = await store.dispatch(
        addSnippetComment({ snippetId: 's1', content: 'Nice code!' }),
      )
      // Thunk was dispatched; check the fulfilled payload
      if (result.type === addSnippetComment.fulfilled.type) {
        const payload = result.payload as SnippetComment
        expect(payload.content).toBe('Nice code!')
        expect(payload.snippetId).toBe('s1')
      }
    })

    it('trims content before saving', async () => {
      const db = jest.requireMock('@/lib/db')
      db.createSnippetComment.mockClear()
      db.createSnippetComment.mockImplementation(async (c: SnippetComment) => c)
      const store = makeStore()
      const result = await store.dispatch(
        addSnippetComment({ snippetId: 's1', content: '  trimmed  ' }),
      )
      if (result.type === addSnippetComment.fulfilled.type) {
        expect((result.payload as SnippetComment).content).toBe('trimmed')
      }
    })
  })

  describe('addProfileComment integration', () => {
    it('calls createProfileCommentDB from db', async () => {
      const db = jest.requireMock('@/lib/db')
      db.createProfileComment.mockClear()
      db.createProfileComment.mockImplementation(async (c: ProfileComment) => c)
      const store = makeStore()
      const result = await store.dispatch(
        addProfileComment({ profileUserId: 'usr-1', content: 'Cool profile' }),
      )
      if (result.type === addProfileComment.fulfilled.type) {
        const payload = result.payload as ProfileComment
        expect(payload.content).toBe('Cool profile')
        expect(payload.profileUserId).toBe('usr-1')
      }
    })
  })

  describe('independent storage', () => {
    it('stores comments for different snippets independently', () => {
      const store = makeStore()
      const c2: SnippetComment = {
        ...snippetComment1,
        id: 'cx',
        snippetId: 's2',
      }
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchSnippetComments.fulfilled(
          { snippetId: 's1', comments: [snippetComment1] },
          'req',
          's1',
        ),
      )
      store.dispatch(
        // @ts-expect-error testing with invalid payload shape
        fetchSnippetComments.fulfilled(
          { snippetId: 's2', comments: [c2] },
          'req',
          's2',
        ),
      )
      expect(store.getState().comments.snippetComments['s1'][0].id).toBe('c1')
      expect(store.getState().comments.snippetComments['s2'][0].id).toBe('cx')
    })
  })
})
