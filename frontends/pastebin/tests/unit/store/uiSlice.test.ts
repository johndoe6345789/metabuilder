import { configureStore } from '@reduxjs/toolkit'
import uiReducer, {
  openViewer,
  closeViewer,
  setSearchQuery,
} from '@/store/slices/uiSlice'
import { Snippet } from '@/lib/types'

const mockSnippet: Snippet = {
  id: '1',
  title: 'Test Snippet',
  description: 'Test',
  code: 'console.log("test")',
  language: 'javascript',
  category: 'test',
  createdAt: 1000,
  updatedAt: 1000,
  hasPreview: false,
  functionName: 'test',
  inputParameters: [],
  namespaceId: 'ns1',
  isTemplate: false,
}

const mockSnippet2: Snippet = {
  id: '2',
  title: 'Another Snippet',
  description: 'Test 2',
  code: 'console.log("test2")',
  language: 'typescript',
  category: 'test',
  createdAt: 2000,
  updatedAt: 2000,
  hasPreview: true,
  functionName: 'test2',
  inputParameters: [],
  namespaceId: 'ns1',
  isTemplate: false,
}

function makeTestStore() {
  return configureStore({
    reducer: {
      ui: uiReducer,
    },
  })
}

describe('uiSlice', () => {
  let store: ReturnType<typeof makeTestStore>

  beforeEach(() => {
    store = makeTestStore()
  })

  describe('initial state', () => {
    it('should initialize with default ui state', () => {
      const state = store.getState().ui
      expect(state.viewerOpen).toBe(false)
      expect(state.viewingSnippet).toBeNull()
      expect(state.searchQuery).toBe('')
    })
  })

  describe('viewer management', () => {
    describe('openViewer', () => {
      it('should open viewer with snippet', () => {
        store.dispatch(openViewer(mockSnippet))

        const state = store.getState().ui
        expect(state.viewerOpen).toBe(true)
        expect(state.viewingSnippet).toEqual(mockSnippet)
      })

      it('should update viewing snippet when opening different snippet', () => {
        store.dispatch(openViewer(mockSnippet))
        expect(store.getState().ui.viewingSnippet).toEqual(mockSnippet)

        store.dispatch(openViewer(mockSnippet2))
        const state = store.getState().ui
        expect(state.viewingSnippet).toEqual(mockSnippet2)
      })

      it('should handle opening viewer multiple times', () => {
        store.dispatch(openViewer(mockSnippet))
        store.dispatch(openViewer(mockSnippet2))
        store.dispatch(openViewer(mockSnippet))

        const state = store.getState().ui
        expect(state.viewingSnippet).toEqual(mockSnippet)
        expect(state.viewerOpen).toBe(true)
      })
    })

    describe('closeViewer', () => {
      it('should close viewer', () => {
        store.dispatch(openViewer(mockSnippet))
        expect(store.getState().ui.viewerOpen).toBe(true)

        store.dispatch(closeViewer())
        const state = store.getState().ui
        expect(state.viewerOpen).toBe(false)
      })

      it('should clear viewing snippet on close', () => {
        store.dispatch(openViewer(mockSnippet))
        expect(store.getState().ui.viewingSnippet).toEqual(mockSnippet)

        store.dispatch(closeViewer())
        const state = store.getState().ui
        expect(state.viewingSnippet).toBeNull()
      })

      it('should handle closing already closed viewer', () => {
        const state1 = store.getState().ui
        expect(state1.viewerOpen).toBe(false)

        store.dispatch(closeViewer())
        const state2 = store.getState().ui
        expect(state2.viewerOpen).toBe(false)
      })
    })
  })

  describe('search functionality', () => {
    describe('setSearchQuery', () => {
      it('should set search query', () => {
        store.dispatch(setSearchQuery('test query'))
        expect(store.getState().ui.searchQuery).toBe('test query')
      })

      it('should update search query', () => {
        store.dispatch(setSearchQuery('first query'))
        expect(store.getState().ui.searchQuery).toBe('first query')

        store.dispatch(setSearchQuery('second query'))
        expect(store.getState().ui.searchQuery).toBe('second query')
      })

      it('should clear search query with empty string', () => {
        store.dispatch(setSearchQuery('query'))
        expect(store.getState().ui.searchQuery).toBe('query')

        store.dispatch(setSearchQuery(''))
        expect(store.getState().ui.searchQuery).toBe('')
      })

      it('should handle special characters in search query', () => {
        const specialQuery = 'test@#$%^&*()'
        store.dispatch(setSearchQuery(specialQuery))
        expect(store.getState().ui.searchQuery).toBe(specialQuery)
      })

      it('should handle long search queries', () => {
        const longQuery = 'a'.repeat(1000)
        store.dispatch(setSearchQuery(longQuery))
        expect(store.getState().ui.searchQuery).toBe(longQuery)
      })

      it('should not affect viewer state', () => {
        store.dispatch(openViewer(mockSnippet2))

        store.dispatch(setSearchQuery('search'))

        const state = store.getState().ui
        expect(state.searchQuery).toBe('search')
        expect(state.viewerOpen).toBe(true)
        expect(state.viewingSnippet).toEqual(mockSnippet2)
      })

      it('should preserve search query when opening/closing viewer', () => {
        store.dispatch(setSearchQuery('persistent query'))

        store.dispatch(openViewer(mockSnippet))
        expect(store.getState().ui.searchQuery).toBe('persistent query')

        store.dispatch(closeViewer())
        expect(store.getState().ui.searchQuery).toBe('persistent query')
      })
    })
  })

  describe('complex state transitions', () => {
    it('should handle full state transition cycle', () => {
      // Initial state
      let state = store.getState().ui
      expect(state.viewerOpen).toBe(false)

      // Set search query
      store.dispatch(setSearchQuery('test'))
      state = store.getState().ui
      expect(state.searchQuery).toBe('test')

      // Open viewer
      store.dispatch(openViewer(mockSnippet2))
      state = store.getState().ui
      expect(state.viewerOpen).toBe(true)
      expect(state.searchQuery).toBe('test')

      // Close viewer
      store.dispatch(closeViewer())
      state = store.getState().ui
      expect(state.viewerOpen).toBe(false)
      expect(state.searchQuery).toBe('test')

      // Clear search
      store.dispatch(setSearchQuery(''))
      state = store.getState().ui
      expect(state.searchQuery).toBe('')
    })

    it('should handle switching between viewer snippets', () => {
      store.dispatch(openViewer(mockSnippet))
      expect(store.getState().ui.viewingSnippet).toEqual(mockSnippet)

      store.dispatch(closeViewer())
      store.dispatch(openViewer(mockSnippet2))
      expect(store.getState().ui.viewingSnippet).toEqual(mockSnippet2)
      expect(store.getState().ui.viewerOpen).toBe(true)
    })
  })
})
