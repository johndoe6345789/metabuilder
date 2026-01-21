import { configureStore } from '@reduxjs/toolkit'
import uiReducer, {
  openDialog,
  closeDialog,
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

describe('uiSlice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer,
      },
    })
  })

  describe('initial state', () => {
    it('should initialize with default ui state', () => {
      const state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.viewerOpen).toBe(false)
      expect(state.editingSnippet).toBeNull()
      expect(state.viewingSnippet).toBeNull()
      expect(state.searchQuery).toBe('')
    })
  })

  describe('dialog management', () => {
    describe('openDialog', () => {
      it('should open dialog without snippet for creating new', () => {
        store.dispatch(openDialog(null))

        const state = store.getState().ui
        expect(state.dialogOpen).toBe(true)
        expect(state.editingSnippet).toBeNull()
      })

      it('should open dialog with snippet for editing', () => {
        store.dispatch(openDialog(mockSnippet))

        const state = store.getState().ui
        expect(state.dialogOpen).toBe(true)
        expect(state.editingSnippet).toEqual(mockSnippet)
      })

      it('should overwrite previous editing snippet when opening new dialog', () => {
        store.dispatch(openDialog(mockSnippet))
        expect(store.getState().ui.editingSnippet).toEqual(mockSnippet)

        store.dispatch(openDialog(mockSnippet2))
        const state = store.getState().ui
        expect(state.editingSnippet).toEqual(mockSnippet2)
      })

      it('should clear editing snippet when opening dialog with null', () => {
        store.dispatch(openDialog(mockSnippet))
        expect(store.getState().ui.editingSnippet).toEqual(mockSnippet)

        store.dispatch(openDialog(null))
        const state = store.getState().ui
        expect(state.dialogOpen).toBe(true)
        expect(state.editingSnippet).toBeNull()
      })

      it('should not affect viewer state', () => {
        store.dispatch(openViewer(mockSnippet))
        expect(store.getState().ui.viewerOpen).toBe(true)

        store.dispatch(openDialog(mockSnippet2))
        const state = store.getState().ui
        expect(state.viewerOpen).toBe(true)
        expect(state.viewingSnippet).toEqual(mockSnippet)
      })
    })

    describe('closeDialog', () => {
      it('should close dialog', () => {
        store.dispatch(openDialog(null))
        expect(store.getState().ui.dialogOpen).toBe(true)

        store.dispatch(closeDialog())
        const state = store.getState().ui
        expect(state.dialogOpen).toBe(false)
      })

      it('should clear editing snippet on close', () => {
        store.dispatch(openDialog(mockSnippet))
        expect(store.getState().ui.editingSnippet).toEqual(mockSnippet)

        store.dispatch(closeDialog())
        const state = store.getState().ui
        expect(state.editingSnippet).toBeNull()
      })

      it('should handle closing already closed dialog', () => {
        const state1 = store.getState().ui
        expect(state1.dialogOpen).toBe(false)

        store.dispatch(closeDialog())
        const state2 = store.getState().ui
        expect(state2.dialogOpen).toBe(false)
      })

      it('should not affect viewer state', () => {
        store.dispatch(openDialog(mockSnippet))
        store.dispatch(openViewer(mockSnippet2))

        store.dispatch(closeDialog())
        const state = store.getState().ui
        expect(state.viewerOpen).toBe(true)
        expect(state.viewingSnippet).toEqual(mockSnippet2)
      })
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

      it('should not affect dialog state', () => {
        store.dispatch(openDialog(mockSnippet))
        expect(store.getState().ui.dialogOpen).toBe(true)

        store.dispatch(openViewer(mockSnippet2))
        const state = store.getState().ui
        expect(state.dialogOpen).toBe(true)
        expect(state.editingSnippet).toEqual(mockSnippet)
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

      it('should not affect dialog state', () => {
        store.dispatch(openDialog(mockSnippet))
        store.dispatch(openViewer(mockSnippet2))

        store.dispatch(closeViewer())
        const state = store.getState().ui
        expect(state.dialogOpen).toBe(true)
        expect(state.editingSnippet).toEqual(mockSnippet)
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

      it('should not affect dialog or viewer state', () => {
        store.dispatch(openDialog(mockSnippet))
        store.dispatch(openViewer(mockSnippet2))

        store.dispatch(setSearchQuery('search'))

        const state = store.getState().ui
        expect(state.searchQuery).toBe('search')
        expect(state.dialogOpen).toBe(true)
        expect(state.viewerOpen).toBe(true)
        expect(state.editingSnippet).toEqual(mockSnippet)
        expect(state.viewingSnippet).toEqual(mockSnippet2)
      })

      it('should preserve search query when opening/closing dialogs', () => {
        store.dispatch(setSearchQuery('persistent query'))

        store.dispatch(openDialog(mockSnippet))
        expect(store.getState().ui.searchQuery).toBe('persistent query')

        store.dispatch(closeDialog())
        expect(store.getState().ui.searchQuery).toBe('persistent query')
      })
    })
  })

  describe('complex state transitions', () => {
    it('should handle opening dialog while viewer is open', () => {
      store.dispatch(openViewer(mockSnippet))
      store.dispatch(openDialog(mockSnippet2))

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.viewerOpen).toBe(true)
      expect(state.editingSnippet).toEqual(mockSnippet2)
      expect(state.viewingSnippet).toEqual(mockSnippet)
    })

    it('should handle opening viewer while dialog is open', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.viewerOpen).toBe(true)
      expect(state.editingSnippet).toEqual(mockSnippet)
      expect(state.viewingSnippet).toEqual(mockSnippet2)
    })

    it('should handle full state transition cycle', () => {
      // Initial state
      let state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.viewerOpen).toBe(false)

      // Open dialog
      store.dispatch(openDialog(mockSnippet))
      state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.editingSnippet).toEqual(mockSnippet)

      // Set search query
      store.dispatch(setSearchQuery('test'))
      state = store.getState().ui
      expect(state.searchQuery).toBe('test')
      expect(state.dialogOpen).toBe(true)

      // Open viewer while dialog open
      store.dispatch(openViewer(mockSnippet2))
      state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.viewerOpen).toBe(true)

      // Close dialog
      store.dispatch(closeDialog())
      state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.viewerOpen).toBe(true)
      expect(state.searchQuery).toBe('test')

      // Close viewer
      store.dispatch(closeViewer())
      state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.viewerOpen).toBe(false)
      expect(state.searchQuery).toBe('test')

      // Clear search
      store.dispatch(setSearchQuery(''))
      state = store.getState().ui
      expect(state.searchQuery).toBe('')
    })

    it('should maintain independent state for dialog and viewer', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))

      expect(store.getState().ui.editingSnippet).toEqual(mockSnippet)
      expect(store.getState().ui.viewingSnippet).toEqual(mockSnippet2)

      // Close dialog should not affect viewer
      store.dispatch(closeDialog())
      expect(store.getState().ui.viewingSnippet).toEqual(mockSnippet2)
      expect(store.getState().ui.viewerOpen).toBe(true)

      // Close viewer should not affect dialog
      store.dispatch(openDialog(mockSnippet2))
      store.dispatch(closeViewer())
      expect(store.getState().ui.editingSnippet).toEqual(mockSnippet2)
      expect(store.getState().ui.dialogOpen).toBe(true)
    })
  })
})
