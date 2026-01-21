import { configureStore } from '@reduxjs/toolkit'
import uiReducer, {
  openDialog,
  closeDialog,
  openViewer,
  closeViewer,
  setSearchQuery,
} from './uiSlice'
import { Snippet } from '@/lib/types'

const mockSnippet: Snippet = {
  id: '1',
  title: 'Test Snippet',
  description: 'Test Description',
  code: 'console.log("test")',
  language: 'javascript',
  category: 'test',
  createdAt: 1000,
  updatedAt: 1000,
  hasPreview: false,
  functionName: 'test',
  inputParameters: [],
}

const mockSnippet2: Snippet = {
  id: '2',
  title: 'Test Snippet 2',
  description: 'Test Description 2',
  code: 'const x = 5',
  language: 'python',
  category: 'math',
  createdAt: 2000,
  updatedAt: 2000,
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
    it('should initialize with correct default state', () => {
      const state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.viewerOpen).toBe(false)
      expect(state.editingSnippet).toBe(null)
      expect(state.viewingSnippet).toBe(null)
      expect(state.searchQuery).toBe('')
    })

    it('should have all expected properties', () => {
      const state = store.getState().ui
      expect(state).toHaveProperty('dialogOpen')
      expect(state).toHaveProperty('viewerOpen')
      expect(state).toHaveProperty('editingSnippet')
      expect(state).toHaveProperty('viewingSnippet')
      expect(state).toHaveProperty('searchQuery')
    })
  })

  describe('reducers - openDialog', () => {
    it('should open dialog with null snippet for new snippet', () => {
      store.dispatch(openDialog(null))
      const state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.editingSnippet).toBe(null)
    })

    it('should open dialog with snippet for editing', () => {
      store.dispatch(openDialog(mockSnippet))
      const state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.editingSnippet).toEqual(mockSnippet)
    })

    it('should set dialog open to true', () => {
      expect(store.getState().ui.dialogOpen).toBe(false)
      store.dispatch(openDialog(mockSnippet))
      expect(store.getState().ui.dialogOpen).toBe(true)
    })

    it('should replace previous editing snippet', () => {
      store.dispatch(openDialog(mockSnippet))
      expect(store.getState().ui.editingSnippet?.id).toBe('1')

      store.dispatch(openDialog(mockSnippet2))
      expect(store.getState().ui.editingSnippet?.id).toBe('2')
    })

    it('should not affect viewer state', () => {
      store.dispatch(openViewer(mockSnippet))
      expect(store.getState().ui.viewerOpen).toBe(true)

      store.dispatch(openDialog(mockSnippet2))
      expect(store.getState().ui.viewerOpen).toBe(true)
    })

    it('should handle opening dialog multiple times', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openDialog(mockSnippet2))
      store.dispatch(openDialog(mockSnippet))

      expect(store.getState().ui.editingSnippet?.id).toBe('1')
      expect(store.getState().ui.dialogOpen).toBe(true)
    })
  })

  describe('reducers - closeDialog', () => {
    it('should close dialog', () => {
      store.dispatch(openDialog(mockSnippet))
      expect(store.getState().ui.dialogOpen).toBe(true)

      store.dispatch(closeDialog())
      expect(store.getState().ui.dialogOpen).toBe(false)
    })

    it('should clear editing snippet', () => {
      store.dispatch(openDialog(mockSnippet))
      expect(store.getState().ui.editingSnippet).toEqual(mockSnippet)

      store.dispatch(closeDialog())
      expect(store.getState().ui.editingSnippet).toBe(null)
    })

    it('should handle closing already closed dialog', () => {
      store.dispatch(closeDialog())
      const state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.editingSnippet).toBe(null)
    })

    it('should not affect viewer state', () => {
      store.dispatch(openViewer(mockSnippet))
      store.dispatch(closeDialog())

      expect(store.getState().ui.viewerOpen).toBe(true)
      expect(store.getState().ui.viewingSnippet).toEqual(mockSnippet)
    })

    it('should handle closing dialog multiple times', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(closeDialog())
      store.dispatch(closeDialog())
      store.dispatch(closeDialog())

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.editingSnippet).toBe(null)
    })
  })

  describe('reducers - openViewer', () => {
    it('should open viewer with snippet', () => {
      store.dispatch(openViewer(mockSnippet))
      const state = store.getState().ui
      expect(state.viewerOpen).toBe(true)
      expect(state.viewingSnippet).toEqual(mockSnippet)
    })

    it('should set viewer open to true', () => {
      expect(store.getState().ui.viewerOpen).toBe(false)
      store.dispatch(openViewer(mockSnippet))
      expect(store.getState().ui.viewerOpen).toBe(true)
    })

    it('should replace previous viewing snippet', () => {
      store.dispatch(openViewer(mockSnippet))
      expect(store.getState().ui.viewingSnippet?.id).toBe('1')

      store.dispatch(openViewer(mockSnippet2))
      expect(store.getState().ui.viewingSnippet?.id).toBe('2')
    })

    it('should not affect dialog state', () => {
      store.dispatch(openDialog(mockSnippet))
      expect(store.getState().ui.dialogOpen).toBe(true)

      store.dispatch(openViewer(mockSnippet2))
      expect(store.getState().ui.dialogOpen).toBe(true)
    })

    it('should handle opening viewer multiple times', () => {
      store.dispatch(openViewer(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))
      store.dispatch(openViewer(mockSnippet))

      expect(store.getState().ui.viewingSnippet?.id).toBe('1')
      expect(store.getState().ui.viewerOpen).toBe(true)
    })

    it('should handle viewer with all snippet properties', () => {
      store.dispatch(openViewer(mockSnippet))
      const viewing = store.getState().ui.viewingSnippet

      expect(viewing?.id).toBe(mockSnippet.id)
      expect(viewing?.title).toBe(mockSnippet.title)
      expect(viewing?.description).toBe(mockSnippet.description)
      expect(viewing?.code).toBe(mockSnippet.code)
      expect(viewing?.language).toBe(mockSnippet.language)
      expect(viewing?.category).toBe(mockSnippet.category)
    })
  })

  describe('reducers - closeViewer', () => {
    it('should close viewer', () => {
      store.dispatch(openViewer(mockSnippet))
      expect(store.getState().ui.viewerOpen).toBe(true)

      store.dispatch(closeViewer())
      expect(store.getState().ui.viewerOpen).toBe(false)
    })

    it('should clear viewing snippet', () => {
      store.dispatch(openViewer(mockSnippet))
      expect(store.getState().ui.viewingSnippet).toEqual(mockSnippet)

      store.dispatch(closeViewer())
      expect(store.getState().ui.viewingSnippet).toBe(null)
    })

    it('should handle closing already closed viewer', () => {
      store.dispatch(closeViewer())
      const state = store.getState().ui
      expect(state.viewerOpen).toBe(false)
      expect(state.viewingSnippet).toBe(null)
    })

    it('should not affect dialog state', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(closeViewer())

      expect(store.getState().ui.dialogOpen).toBe(true)
      expect(store.getState().ui.editingSnippet).toEqual(mockSnippet)
    })

    it('should handle closing viewer multiple times', () => {
      store.dispatch(openViewer(mockSnippet))
      store.dispatch(closeViewer())
      store.dispatch(closeViewer())
      store.dispatch(closeViewer())

      const state = store.getState().ui
      expect(state.viewerOpen).toBe(false)
      expect(state.viewingSnippet).toBe(null)
    })
  })

  describe('reducers - setSearchQuery', () => {
    it('should set search query', () => {
      store.dispatch(setSearchQuery('test'))
      expect(store.getState().ui.searchQuery).toBe('test')
    })

    it('should replace previous search query', () => {
      store.dispatch(setSearchQuery('first'))
      expect(store.getState().ui.searchQuery).toBe('first')

      store.dispatch(setSearchQuery('second'))
      expect(store.getState().ui.searchQuery).toBe('second')
    })

    it('should handle empty search query', () => {
      store.dispatch(setSearchQuery('test'))
      store.dispatch(setSearchQuery(''))
      expect(store.getState().ui.searchQuery).toBe('')
    })

    it('should handle long search query', () => {
      const longQuery = 'a'.repeat(500)
      store.dispatch(setSearchQuery(longQuery))
      expect(store.getState().ui.searchQuery).toBe(longQuery)
    })

    it('should handle special characters in search query', () => {
      const specialQuery = '@#$%^&*()'
      store.dispatch(setSearchQuery(specialQuery))
      expect(store.getState().ui.searchQuery).toBe(specialQuery)
    })

    it('should handle search query with spaces', () => {
      const queryWithSpaces = 'hello world test query'
      store.dispatch(setSearchQuery(queryWithSpaces))
      expect(store.getState().ui.searchQuery).toBe(queryWithSpaces)
    })

    it('should handle search query with newlines', () => {
      const queryWithNewlines = 'test\nquery\nwith\nnewlines'
      store.dispatch(setSearchQuery(queryWithNewlines))
      expect(store.getState().ui.searchQuery).toBe(queryWithNewlines)
    })

    it('should handle unicode characters in search query', () => {
      const unicodeQuery = '测试搜索查询'
      store.dispatch(setSearchQuery(unicodeQuery))
      expect(store.getState().ui.searchQuery).toBe(unicodeQuery)
    })

    it('should not affect other UI state', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))

      store.dispatch(setSearchQuery('test'))

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.viewerOpen).toBe(true)
      expect(state.editingSnippet).toEqual(mockSnippet)
      expect(state.viewingSnippet).toEqual(mockSnippet2)
    })

    it('should handle rapid search query updates', () => {
      const queries = ['a', 'ab', 'abc', 'abcd', 'abcde']
      queries.forEach(q => store.dispatch(setSearchQuery(q)))

      expect(store.getState().ui.searchQuery).toBe('abcde')
    })
  })

  describe('dialog and viewer interactions', () => {
    it('should handle opening both dialog and viewer', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.viewerOpen).toBe(true)
      expect(state.editingSnippet?.id).toBe('1')
      expect(state.viewingSnippet?.id).toBe('2')
    })

    it('should handle opening dialog then viewer then closing both', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))
      store.dispatch(closeDialog())
      store.dispatch(closeViewer())

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.viewerOpen).toBe(false)
      expect(state.editingSnippet).toBe(null)
      expect(state.viewingSnippet).toBe(null)
    })

    it('should allow switching between dialog and viewer', () => {
      store.dispatch(openDialog(mockSnippet))
      expect(store.getState().ui.dialogOpen).toBe(true)

      store.dispatch(closeDialog())
      store.dispatch(openViewer(mockSnippet2))
      expect(store.getState().ui.viewerOpen).toBe(true)
      expect(store.getState().ui.dialogOpen).toBe(false)
    })

    it('should handle opening same snippet in dialog and viewer', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet))

      const state = store.getState().ui
      expect(state.editingSnippet?.id).toBe(state.viewingSnippet?.id)
      expect(state.dialogOpen).toBe(true)
      expect(state.viewerOpen).toBe(true)
    })
  })

  describe('combined operations', () => {
    it('should handle complete workflow: open, edit, close, view, close', () => {
      store.dispatch(openDialog(mockSnippet))
      expect(store.getState().ui.dialogOpen).toBe(true)

      store.dispatch(closeDialog())
      expect(store.getState().ui.dialogOpen).toBe(false)

      store.dispatch(openViewer(mockSnippet))
      expect(store.getState().ui.viewerOpen).toBe(true)

      store.dispatch(closeViewer())
      expect(store.getState().ui.viewerOpen).toBe(false)
    })

    it('should handle search with dialog and viewer open', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))

      store.dispatch(setSearchQuery('test query'))

      const state = store.getState().ui
      expect(state.searchQuery).toBe('test query')
      expect(state.dialogOpen).toBe(true)
      expect(state.viewerOpen).toBe(true)
    })

    it('should handle opening different snippets in rapid succession', () => {
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          store.dispatch(openDialog(mockSnippet))
        } else {
          store.dispatch(openDialog(mockSnippet2))
        }
      }

      expect(store.getState().ui.editingSnippet?.id).toBe('2')
      expect(store.getState().ui.dialogOpen).toBe(true)
    })

    it('should handle clearing search while dialog is open', () => {
      store.dispatch(setSearchQuery('initial search'))
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(setSearchQuery(''))

      const state = store.getState().ui
      expect(state.searchQuery).toBe('')
      expect(state.dialogOpen).toBe(true)
    })
  })

  describe('state consistency', () => {
    it('should maintain state consistency after many operations', () => {
      const operations = [
        () => store.dispatch(openDialog(mockSnippet)),
        () => store.dispatch(setSearchQuery('search')),
        () => store.dispatch(openViewer(mockSnippet2)),
        () => store.dispatch(setSearchQuery('')),
        () => store.dispatch(closeDialog()),
        () => store.dispatch(closeViewer()),
      ]

      operations.forEach(op => op())

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.viewerOpen).toBe(false)
      expect(state.editingSnippet).toBe(null)
      expect(state.viewingSnippet).toBe(null)
      expect(state.searchQuery).toBe('')
    })

    it('should preserve all state properties through operations', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))
      store.dispatch(setSearchQuery('test'))

      const state = store.getState().ui
      expect(Object.keys(state)).toContain('dialogOpen')
      expect(Object.keys(state)).toContain('viewerOpen')
      expect(Object.keys(state)).toContain('editingSnippet')
      expect(Object.keys(state)).toContain('viewingSnippet')
      expect(Object.keys(state)).toContain('searchQuery')
    })

    it('should return to initial state when operations are reversed', () => {
      store.dispatch(openDialog(mockSnippet))
      store.dispatch(openViewer(mockSnippet2))
      store.dispatch(setSearchQuery('test'))

      store.dispatch(closeDialog())
      store.dispatch(closeViewer())
      store.dispatch(setSearchQuery(''))

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.viewerOpen).toBe(false)
      expect(state.editingSnippet).toBe(null)
      expect(state.viewingSnippet).toBe(null)
      expect(state.searchQuery).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle snippets with minimal properties', () => {
      const minimalSnippet: Snippet = {
        id: 'test',
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        category: '',
        createdAt: 0,
        updatedAt: 0,
      }

      store.dispatch(openDialog(minimalSnippet))
      store.dispatch(openViewer(minimalSnippet))

      const state = store.getState().ui
      expect(state.editingSnippet).toEqual(minimalSnippet)
      expect(state.viewingSnippet).toEqual(minimalSnippet)
    })

    it('should handle very long search query', () => {
      const veryLongQuery = 'a'.repeat(10000)
      store.dispatch(setSearchQuery(veryLongQuery))
      expect(store.getState().ui.searchQuery.length).toBe(10000)
    })

    it('should handle rapid open-close cycles', () => {
      for (let i = 0; i < 100; i++) {
        store.dispatch(openDialog(mockSnippet))
        store.dispatch(closeDialog())
      }

      const state = store.getState().ui
      expect(state.dialogOpen).toBe(false)
      expect(state.editingSnippet).toBe(null)
    })

    it('should handle null snippet in openDialog', () => {
      store.dispatch(openDialog(null))
      const state = store.getState().ui
      expect(state.dialogOpen).toBe(true)
      expect(state.editingSnippet).toBe(null)
    })

    it('should handle search query with regex-like strings', () => {
      const regexQuery = '/test.*pattern/gi'
      store.dispatch(setSearchQuery(regexQuery))
      expect(store.getState().ui.searchQuery).toBe(regexQuery)
    })

    it('should handle search query with HTML', () => {
      const htmlQuery = '<div>test</div>'
      store.dispatch(setSearchQuery(htmlQuery))
      expect(store.getState().ui.searchQuery).toBe(htmlQuery)
    })

    it('should handle search query with JSON', () => {
      const jsonQuery = '{"key": "value"}'
      store.dispatch(setSearchQuery(jsonQuery))
      expect(store.getState().ui.searchQuery).toBe(jsonQuery)
    })
  })
})
